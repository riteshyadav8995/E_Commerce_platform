const prisma = require('../utils/prisma');
const { withBillNumber } = require('../utils/billNumber');
const { frontendUrl } = require('../utils/appUrls');
const {
  confirmBillPayment,
  sendOrderConfirmationNotifications,
} = require('../services/paymentService');

const STAFF_ROLES = ['Admin', 'Manager', 'Cashier', 'DeliveryBoy'];

// Invoices and packing slips are addressed by bill number, which is a short
// sequential string. Without this check any signed-in user could walk
// BILL-000001, BILL-000002, ... and download every other customer's invoice.
const canAccessBill = (user, bill) =>
  STAFF_ROLES.includes(user?.role?.name) ||
  (bill.userId != null && bill.userId === user?.id);

// ─── POST /api/billing ─────────────────────────────────────────────────────────
// Body: { items: [{productId, quantity}], discount, paymentMode, note }
const createBill = async (req, res) => {
  try {
    const {
      items = [],
      discount = 0,
      paymentMode = 'CASH',
      note,
      callbackUrl,
      isPOS = false,
    } = req.body;

    if (!items.length) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Collapse repeated lines for the same product into one. Without this a
    // cart holding the same product twice produced duplicate ids, and the
    // length check below rejected the whole order as "product not found".
    const mergedItems = [];
    const itemIndexByProduct = new Map();
    for (const item of items) {
      const productId = parseInt(item.productId);
      const quantity = parseInt(item.quantity);
      if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Each item needs a valid productId and a positive quantity' });
      }
      if (itemIndexByProduct.has(productId)) {
        mergedItems[itemIndexByProduct.get(productId)].quantity += quantity;
      } else {
        itemIndexByProduct.set(productId, mergedItems.length);
        mergedItems.push({ productId, quantity });
      }
    }

    // Load product + inventory data for each item
    const productIds = mergedItems.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'active' },
      include: {
        inventories: { orderBy: { quantity: 'desc' }, take: 1 },
      },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'One or more products not found or inactive' });
    }

    const productById = new Map(products.map((p) => [p.id, p]));

    // Validate stock availability
    for (const item of mergedItems) {
      const product = productById.get(item.productId);
      const availableStock = product.inventories[0]?.quantity ?? 0;
      if (availableStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${availableStock}`,
        });
      }
    }

    // Calculate totals. Money is rounded to paise at every step so the stored
    // Decimal(10,2) values and the amount handed to the payment gateway agree.
    const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

    let totalAmount = 0;
    let taxAmount = 0;
    const billItemsData = mergedItems.map((item) => {
      const product = productById.get(item.productId);
      const unitPrice = parseFloat(product.price);
      const subtotal = round2(unitPrice * item.quantity);
      totalAmount = round2(totalAmount + subtotal);
      taxAmount = round2(taxAmount + subtotal * (parseFloat(product.tax) / 100));
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      };
    });

    const discountAmount = round2(parseFloat(discount) || 0);
    const grandTotal = round2(totalAmount - discountAmount + taxAmount);

    // Run everything in a transaction
    const isPendingPayment = paymentMode === 'LINK' || (isPOS && paymentMode === 'UPI');

    const transactionResult = await withBillNumber((billNumber) =>
      prisma.$transaction(async (tx) => {
      // 1. Create Bill
      const newBill = await tx.bill.create({
        data: {
          billNumber,
          totalAmount,
          discount: discountAmount,
          tax: taxAmount,
          grandTotal,
          status: (paymentMode === 'LINK' || (isPOS && paymentMode === 'UPI')) ? 'PENDING' : 'PAID',
          paymentMode,
          paymentStatus: (paymentMode === 'LINK' || (isPOS && paymentMode === 'UPI')) ? 'PENDING' : 'PAID',
          shippingStatus: isPOS ? 'N/A' : 'PENDING',
          note: note || null,
          user: req.user?.id ? { connect: { id: req.user.id } } : undefined,
          items: { create: billItemsData },
          trackingEvents: {
            create: { status: 'Order Placed', message: 'Your order has been placed successfully.' }
          }
        },
        include: {
          items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
          user: { select: { id: true, name: true, phone: true, email: true } },
        },
      });

      const modifiedInventoryIds = [];

      // 2. Decrement inventory + log stock transaction for each item ONLY if not pending payment
      if (!isPendingPayment) {
        for (const item of mergedItems) {
          const product = productById.get(item.productId);
          const mainInventory = product.inventories[0]; // use highest-stock inventory record
          if (!mainInventory) continue;

          await tx.inventory.update({
            where: { id: mainInventory.id },
            data: { quantity: { decrement: item.quantity } },
          });

          await tx.stockTransaction.create({
            data: {
              inventoryId: mainInventory.id,
              type: 'OUT',
              quantity: item.quantity,
              reason: `Sale — ${newBill.billNumber}`,
              userId: req.user?.id || null,
            },
          });

          modifiedInventoryIds.push(mainInventory.id);
        }
      }

      return { newBill, modifiedInventoryIds };
      })
    );

    let bill = transactionResult.newBill;
    const modifiedInventoryIds = transactionResult.modifiedInventoryIds;

    // Check low stock and notify admin for items deducted in this bill
    const { checkAndNotifyLowStock } = require('../services/inventoryService');
    for (const invId of modifiedInventoryIds) {
      await checkAndNotifyLowStock(invId);
    }

    if (paymentMode === 'LINK') {
      try {
        const { createOrder } = require('../services/razorpayService');
        const order = await createOrder(bill.grandTotal, bill.billNumber);
        bill = await prisma.bill.update({
          where: { id: bill.id },
          data: { paymentLinkId: order.id }, // Reusing paymentLinkId for order ID
          include: { items: true, user: true },
        });
        bill.razorpayOrderId = order.id;
        bill.razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
      } catch (err) {
        console.error('Failed to generate razorpay order', err);
      }
    } else if (paymentMode === 'CASH') {
      // Send notifications immediately for COD
      await sendOrderConfirmationNotifications(
        bill,
        `Your order ${bill.billNumber} has been successfully confirmed!`
      );
    }

    res.status(201).json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/billing ──────────────────────────────────────────────────────────
// Query: ?page=1&limit=20&from=YYYY-MM-DD&to=YYYY-MM-DD&status=PAID
const getAllBills = async (req, res) => {
  try {
    const { page = 1, limit = 20, from, to, status, paymentMode } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (paymentMode) where.paymentMode = paymentMode;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          items: { include: { product: { select: { name: true } } } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.bill.count({ where }),
    ]);

    res.json({ bills, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/billing/:id ──────────────────────────────────────────────────────
const getBillById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, imageUrl: true },
            },
          },
        },
        user: { select: { id: true, name: true } },
        deliveryBoy: { select: { id: true, name: true } },
        trackingEvents: { orderBy: { createdAt: 'desc' } },
        feedback: true,
      },
    });

    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const trackOrderByBillNumber = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const bill = await prisma.bill.findUnique({
      where: { billNumber },
      include: {
        user: { select: { name: true, phone: true, address: true } },
        items: { include: { product: { select: { id: true, name: true, imageUrl: true } }, returnRequests: true } },
        trackingEvents: { orderBy: { createdAt: 'desc' } },
        feedback: true,
      },
    });

    if (!bill) return res.status(404).json({ message: 'Order not found' });

    res.json(bill);
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── PUT /api/billing/:id/cancel ──────────────────────────────────────────────
const cancelBill = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: { inventories: { orderBy: { quantity: 'desc' }, take: 1 } },
            },
          },
        },
      },
    });

    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    if (bill.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Bill is already cancelled' });
    }

    const stockWasDeducted = bill.paymentStatus === 'PAID';

    const updatedBill = await prisma.$transaction(async (tx) => {
      // Mark bill cancelled
      const b = await tx.bill.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          items: { include: { product: { select: { name: true } } } },
          user: { select: { id: true, name: true } },
        },
      });

      // Restore inventory only for bills whose stock was actually taken.
      // Orders awaiting payment (online links, POS UPI) never left inventory,
      // so restocking them here invented stock that does not exist.
      for (const item of stockWasDeducted ? bill.items : []) {
        const mainInventory = item.product.inventories[0];
        if (!mainInventory) continue;

        await tx.inventory.update({
          where: { id: mainInventory.id },
          data: { quantity: { increment: item.quantity } },
        });

        await tx.stockTransaction.create({
          data: {
            inventoryId: mainInventory.id,
            type: 'IN',
            quantity: item.quantity,
            reason: `Cancellation — ${bill.billNumber}`,
            userId: req.user?.id || null,
          },
        });
      }

      return b;
    });

    res.json(updatedBill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── PATCH /api/billing/:id/shipping ───────────────────────────────────────────
const updateShippingStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, location, message } = req.body;
    
    if (!['PENDING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const bill = await prisma.bill.findUnique({ where: { id }, include: { customer: true, user: true } });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.bill.update({
        where: { id },
        data: { shippingStatus: status },
        include: { customer: true, user: true, items: { include: { product: true } } }
      });
      
      await tx.orderTracking.create({
        data: {
          billId: id,
          status,
          location: location || null,
          message: message || `Order has been marked as ${status}`,
        }
      });
      return b;
    });

    const { sendWhatsAppMessage } = require('../services/whatsappService');
    const storeUrl = frontendUrl();
    const phone = updated.user?.phone || updated.customer?.phone || bill.customer?.phone;
    
    if (phone) {
      let whatsappMessage = `*Order Update 📦*\n\nYour Order *${updated.billNumber}* is now: *${status}*.`;
      if (status === 'SHIPPED') {
         whatsappMessage = `*Great News! 🚀*\n\nYour Order *${updated.billNumber}* has been *SHIPPED*! It is on its way to you.\n\nTrack your order here: ${storeUrl}/track-order/${updated.billNumber}`;
      } else if (status === 'OUT_FOR_DELIVERY') {
         whatsappMessage = `*Out for Delivery! 🛵*\n\nYour Order *${updated.billNumber}* is out for delivery. Our rider will reach you shortly.`;
      } else if (status === 'DELIVERED') {
         whatsappMessage = `*Order Delivered! 🎉*\n\nYour Order *${updated.billNumber}* has been successfully delivered.\n\nPlease share your feedback about the delivery experience:\n${storeUrl}/delivery-feedback/${updated.billNumber}`;
      }
      await sendWhatsAppMessage(phone, whatsappMessage).catch(console.error);
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── POST /api/billing/verify-payment ───────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const { payment_link_id } = req.body;

    // This endpoint is unauthenticated (the browser hits it on return from the
    // gateway), so the identifier is the only thing tying a request to a bill.
    // It used to accept a request carrying only payment_id, which left
    // paymentLinkId undefined — and Prisma drops undefined filters, so
    // findFirst happily returned an arbitrary bill and marked it PAID.
    if (!payment_link_id || typeof payment_link_id !== 'string') {
      return res.status(400).json({ message: 'payment_link_id is required' });
    }

    const existing = await prisma.bill.findFirst({
      where: { paymentLinkId: payment_link_id },
      select: { id: true, billNumber: true },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const result = await confirmBillPayment(existing.id, {
      reason: `Sale — ${existing.billNumber} (Online Payment Success)`,
      trackingMessage: 'Online payment has been successfully verified.',
    });

    if (!result) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (!result.alreadyPaid) {
      await sendOrderConfirmationNotifications(
        result.bill,
        `Your payment was successful and order ${result.bill.billNumber} has been confirmed!`
      );
    }

    res.json({ success: true, bill: result.bill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/billing/delivery-tasks ───────────────────────────────────────────
const getDeliveryTasks = async (req, res) => {
  try {
    const deliveryBoyId = req.user?.id;
    if (!deliveryBoyId) return res.status(401).json({ message: 'Not authorized' });

    const bills = await prisma.bill.findMany({
      where: { deliveryBoyId },
      include: {
        customer: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── PATCH /api/billing/:id/assign-delivery ────────────────────────────────────
const assignDeliveryBoy = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { deliveryBoyId } = req.body;

    const bill = await prisma.bill.findUnique({ where: { id } });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    const updated = await prisma.bill.update({
      where: { id },
      data: { deliveryBoyId: parseInt(deliveryBoyId) || null },
      include: {
        deliveryBoy: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/billing/my-orders ─────────────────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.bill.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, imageUrl: true }
            },
            returnRequests: true
          }
        },
        trackingEvents: true,
        feedback: true
      }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/billing/invoice/:billNumber ──────────────────────────────────────
const downloadInvoice = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const bill = await prisma.bill.findUnique({
      where: { billNumber },
      include: {
        items: {
          include: { product: true }
        },
        user: true,
        customer: true,
      }
    });

    if (!bill) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!canAccessBill(req.user, bill)) {
      return res.status(403).json({ message: 'Not authorized for this order' });
    }

    const { generateBillPDF } = require('../services/pdfService');
    const pdfBuffer = await generateBillPDF(bill);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${billNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/billing/packing-slip/:billNumber ──────────────────────────────────────
const downloadPackingSlip = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const bill = await prisma.bill.findUnique({
      where: { billNumber },
      include: {
        items: {
          include: { product: true }
        },
        user: true,
        customer: true,
      }
    });

    if (!bill) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!canAccessBill(req.user, bill)) {
      return res.status(403).json({ message: 'Not authorized for this order' });
    }

    const { generatePackingSlipPDF } = require('../services/pdfService');
    const pdfBuffer = await generatePackingSlipPDF(bill);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="packing-slip-${billNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Packing slip generation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── POST /api/billing/return-request ─────────────────────────────────────────
const submitReturnRequest = async (req, res) => {
  try {
    const { billItemId, reason, refundMethod, refundDetails } = req.body;
    
    if (!billItemId || !reason || !refundMethod || !refundDetails) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const billItem = await prisma.billItem.findUnique({
      where: { id: parseInt(billItemId) },
      include: { bill: true }
    });

    if (!billItem) {
      return res.status(404).json({ message: 'Bill item not found' });
    }

    if (billItem.bill.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this order' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        billItemId: parseInt(billItemId),
        reason,
        refundMethod,
        refundDetails,
        imageUrl,
      }
    });

    res.status(201).json({ message: 'Return request submitted successfully', returnRequest });
  } catch (error) {
    console.error('Submit return error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/billing/return-requests (ADMIN) ──────────────────────────────────
const getAllReturnRequests = async (req, res) => {
  try {
    const returnRequests = await prisma.returnRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        billItem: {
          include: {
            product: { select: { name: true, imageUrl: true } },
            bill: { select: { billNumber: true, user: { select: { name: true, email: true } } } }
          }
        }
      }
    });
    res.json(returnRequests);
  } catch (error) {
    console.error('Get return requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── PUT /api/billing/return-requests/:id/status (ADMIN) ──────────────────────
const updateReturnRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const returnRequest = await prisma.returnRequest.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({ message: 'Status updated successfully', returnRequest });
  } catch (error) {
    console.error('Update return request status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/billing/export/csv (ADMIN) ──────────────────────────────────────
const exportOrdersCsv = async (req, res) => {
  try {
    const { Parser } = require('json2csv');

    const orders = await prisma.bill.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        customer: { select: { name: true, phone: true } },
        items: { include: { product: { select: { name: true } } } }
      }
    });

    const data = orders.map(order => {
      const customerName = order.user?.name || order.customer?.name || 'Guest';
      const customerEmail = order.user?.email || 'N/A';
      const customerPhone = order.user?.phone || order.customer?.phone || 'N/A';
      const productNames = order.items.map(item => item.product.name).join(' | ');

      return {
        'Order Number': order.billNumber,
        'Date': new Date(order.createdAt).toLocaleDateString(),
        'Customer Name': customerName,
        'Customer Email': customerEmail,
        'Customer Phone': customerPhone,
        'Products': productNames,
        'Total Amount': parseFloat(order.grandTotal).toFixed(2),
        'Payment Mode': order.paymentMode,
        'Payment Status': order.paymentStatus,
        'Shipping Status': order.shippingStatus,
      };
    });

    const fields = ['Order Number', 'Date', 'Customer Name', 'Customer Email', 'Customer Phone', 'Products', 'Total Amount', 'Payment Mode', 'Payment Status', 'Shipping Status'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('orders_export.csv');
    return res.send(csv);

  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({ message: 'Server error during CSV export' });
  }
};

// ─── PUT /api/billing/:id/mark-paid ───────────────────────────────────────────
const markPaid = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const bill = await prisma.bill.findUnique({
      where: { id },
      select: { id: true, billNumber: true, paymentStatus: true },
    });

    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    if (bill.paymentStatus === 'PAID') return res.status(400).json({ message: 'Bill is already paid' });

    const result = await confirmBillPayment(id, {
      userId: req.user?.id || null,
      reason: `Sale — ${bill.billNumber} (Manual Confirm)`,
      trackingMessage: 'Payment confirmed manually by staff.',
    });

    if (!result) return res.status(404).json({ message: 'Bill not found' });

    res.json({ success: true, bill: result.bill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createBill, getAllBills, getBillById,  cancelBill,
  updateShippingStatus,
  verifyPayment,
  assignDeliveryBoy,
  getDeliveryTasks,
  trackOrderByBillNumber,
  getMyOrders,
  downloadInvoice,
  downloadPackingSlip,
  submitReturnRequest,
  getAllReturnRequests,
  updateReturnRequestStatus,
  exportOrdersCsv,
  markPaid
};
