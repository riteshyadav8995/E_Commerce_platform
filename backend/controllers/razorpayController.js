const crypto = require('crypto');
const prisma = require('../utils/prisma');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const { generateBillPDF } = require('../services/pdfService');
const { sendBillEmail } = require('../services/emailService');

const handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Validate signature if secret is provided (skipped if mock)
    if (secret && req.headers['x-razorpay-signature']) {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== req.headers['x-razorpay-signature']) {
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const { event, payload } = req.body;

    // Payment Success Event
    if (event === 'payment_link.paid' || event === 'payment.captured') {
      const paymentLinkId = payload?.payment_link?.entity?.id;
      const orderId = payload?.payment?.entity?.order_id || payload?.payment_link?.entity?.reference_id;
      
      // Find bill by payment link or reference id
      let bill = await prisma.bill.findFirst({
        where: { OR: [{ paymentLinkId }, { billNumber: orderId }] },
        include: { 
          customer: true,
          user: true,
          items: { include: { product: true } }
        }
      });

      if (bill) {
        await prisma.bill.update({
          where: { id: bill.id },
          data: { paymentStatus: 'PAID', status: 'PAID' }
        });

        if (bill.customer?.phone) {
          await sendWhatsAppMessage(bill.customer.phone, `Payment Received ✅\n\nYour Order *${bill.billNumber}* is confirmed. We will notify you when it ships.`);
        }

        try {
          if (bill.user && bill.user.email) {
            const pdfBuffer = await generateBillPDF(bill);
            await sendBillEmail(bill.user.email, bill.billNumber, pdfBuffer);
          }
        } catch(e) {
          console.error("Failed to generate/send PDF email", e);
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    res.status(500).send("Error");
  }
};

module.exports = { handleRazorpayWebhook };
