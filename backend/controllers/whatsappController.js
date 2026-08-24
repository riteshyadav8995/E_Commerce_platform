const prisma = require('../utils/prisma');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const { generatePaymentLink } = require('../services/razorpayService');
const { withBillNumber } = require('../utils/billNumber');

// Verify webhook (GET /api/whatsapp/webhook)
const verifyWebhook = (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "mytoken";
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
};

// Receive messages (POST /api/whatsapp/webhook)
const handleIncomingMessage = async (req, res) => {
  console.log("=== INCOMING WEBHOOK ===", JSON.stringify(req.body, null, 2));
  try {
    const body = req.body;
    if (body.object) {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
        const msg = body.entry[0].changes[0].value.messages[0];
        const phone = msg.from;
        const text = msg.text?.body?.trim();

        if (text) {
          // Send 200 OK early to Meta
          res.sendStatus(200);

          // Log message to database
          await prisma.whatsAppMessage.create({
            data: { phone, message: text }
          });

          // 1. Ensure Customer exists
          let customer = await prisma.customer.findUnique({ where: { phone } });
          if (!customer) {
            customer = await prisma.customer.create({ data: { phone, name: msg.profile?.name || 'Customer' } });
          }

          const lowerText = text.toLowerCase();

          // 2. Chat logic
          if (lowerText === 'hi' || lowerText === 'hello') {
            await sendWhatsAppMessage(phone, "Welcome to our store! 🛒\n\nCommands you can use:\n- *Show [Category]* (e.g. Show Mobiles)\n- *Buy [Product]* (e.g. Buy iPhone 16)\n- *Cart* to view items\n- *Checkout* to pay");
          } 
          else if (lowerText.startsWith('show')) {
            const categoryName = text.substring(5).trim();
            const products = await prisma.product.findMany({
              where: {
                category: { name: { contains: categoryName, mode: 'insensitive' } },
                status: 'active'
              },
              include: { inventories: { take: 1 } }
            });

            if (products.length === 0) {
              await sendWhatsAppMessage(phone, `Sorry, no products found for '${categoryName}'.`);
            } else {
              let reply = `Here are our ${categoryName}:\n\n`;
              products.forEach(p => {
                const stock = p.inventories[0]?.quantity || 0;
                reply += `*${p.name}*\nPrice: ₹${p.price}\nStock: ${stock > 0 ? stock : 'Out of stock'}\n\n`;
              });
              reply += `Reply with "Buy [Product]" to add to cart.`;
              await sendWhatsAppMessage(phone, reply);
            }
          }
          else if (lowerText.startsWith('buy')) {
            const productName = text.substring(4).trim();
            const product = await prisma.product.findFirst({
              where: { name: { contains: productName, mode: 'insensitive' }, status: 'active' },
              include: { inventories: { take: 1 } }
            });

            if (!product) {
              await sendWhatsAppMessage(phone, `Product '${productName}' not found.`);
            } else {
              const stock = product.inventories[0]?.quantity || 0;
              if (stock < 1) {
                await sendWhatsAppMessage(phone, `Sorry, ${product.name} is currently out of stock.`);
              } else {
                // Find or create cart
                let cart = await prisma.cart.findFirst({ where: { customerId: customer.id } });
                if (!cart) cart = await prisma.cart.create({ data: { customerId: customer.id } });

                // Add item
                await prisma.cartItem.create({
                  data: { cartId: cart.id, productId: product.id, quantity: 1 }
                });

                await sendWhatsAppMessage(phone, `Added *${product.name}* to your cart. 🛒\nReply "Checkout" to complete your purchase or "Cart" to view.`);
              }
            }
          }
          else if (lowerText === 'cart') {
            const cart = await prisma.cart.findFirst({
              where: { customerId: customer.id },
              include: { items: { include: { product: true } } }
            });

            if (!cart || cart.items.length === 0) {
              await sendWhatsAppMessage(phone, "Your cart is empty.");
            } else {
              let reply = "Your Cart:\n\n";
              let total = 0;
              cart.items.forEach(item => {
                reply += `*${item.product.name}* x ${item.quantity} = ₹${parseFloat(item.product.price) * item.quantity}\n`;
                total += parseFloat(item.product.price) * item.quantity;
              });
              reply += `\n*Total: ₹${total.toFixed(2)}*\n\nReply "Checkout" to pay.`;
              await sendWhatsAppMessage(phone, reply);
            }
          }
          else if (lowerText === 'checkout') {
            const cart = await prisma.cart.findFirst({
              where: { customerId: customer.id },
              include: { items: { include: { product: { include: { inventories: { take: 1 } } } } } }
            });

            if (!cart || cart.items.length === 0) {
              await sendWhatsAppMessage(phone, "Your cart is empty.");
              return;
            }

            // Calculate totals, rounded to paise so the stored Decimal(10,2)
            // and the amount sent to the gateway agree.
            const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
            let totalAmount = 0;
            let taxAmount = 0;
            const billItemsData = [];
            
            for (const item of cart.items) {
              const unitPrice = parseFloat(item.product.price);
              const qty = parseInt(item.quantity);
              const subtotal = round2(unitPrice * qty);
              totalAmount = round2(totalAmount + subtotal);
              taxAmount = round2(taxAmount + subtotal * (parseFloat(item.product.tax) / 100));
              billItemsData.push({
                productId: item.productId,
                quantity: qty,
                unitPrice,
                subtotal
              });
            }

            const grandTotal = round2(totalAmount + taxAmount);

            // Transaction: Create Bill -> Clear Cart -> Generate Link
            //
            // Stock is deliberately NOT deducted here. This order is created
            // PENDING and its stock comes out when the payment is confirmed,
            // exactly like the web "pay by link" flow. Deducting here as well
            // meant every WhatsApp order was subtracted from inventory twice.
            try {
              const result = await withBillNumber((billNumber) =>
                prisma.$transaction(async (tx) => {
                const bill = await tx.bill.create({
                  data: {
                    billNumber,
                    totalAmount,
                    tax: taxAmount,
                    grandTotal,
                    status: 'PENDING',
                    paymentMode: 'LINK',
                    paymentStatus: 'PENDING',
                    shippingStatus: 'PENDING',
                    customerId: customer.id,
                    items: { create: billItemsData }
                  }
                });

                // Clear cart
                await tx.cart.delete({ where: { id: cart.id } });

                return bill;
                })
              );

              // Generate Razorpay Link
              const paymentLink = await generatePaymentLink(
                parseFloat(result.grandTotal),
                result.billNumber,
                `Order ${result.billNumber}`
              );

              // Save link to bill
              await prisma.bill.update({
                where: { id: result.id },
                data: { paymentLinkId: paymentLink.id }
              });

              await sendWhatsAppMessage(phone, `Order *${result.billNumber}* Created ✅\n\nGrand Total: ₹${parseFloat(result.grandTotal).toFixed(2)}\n\nPlease pay here: ${paymentLink.short_url}`);

            } catch (err) {
              console.error(err);
              await sendWhatsAppMessage(phone, "An error occurred during checkout. Please try again later.");
            }
          }
          else {
            await sendWhatsAppMessage(phone, "Sorry, I didn't understand that. Type 'Hi' for options.");
          }
        } else {
           res.sendStatus(200); // Non-text message
        }
      } else {
        res.sendStatus(200); // Other webhook events
      }
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error("Webhook Error:", err);
    if (!res.headersSent) res.sendStatus(500);
  }
};

module.exports = { verifyWebhook, handleIncomingMessage };
