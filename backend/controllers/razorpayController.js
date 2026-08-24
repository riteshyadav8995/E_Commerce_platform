const crypto = require('crypto');
const prisma = require('../utils/prisma');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const {
  confirmBillPayment,
  sendOrderConfirmationNotifications,
} = require('../services/paymentService');

const handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // When a secret is configured the signature is mandatory. The old check
    // was `if (secret && signatureHeader)`, so an attacker could forge a
    // "payment succeeded" event simply by omitting the header.
    if (secret) {
      const signature = req.headers['x-razorpay-signature'];
      if (!signature) {
        return res.status(400).json({ error: 'Missing signature' });
      }

      const digest = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      const digestBuffer = Buffer.from(digest, 'utf8');
      const signatureBuffer = Buffer.from(String(signature), 'utf8');

      if (
        digestBuffer.length !== signatureBuffer.length ||
        !crypto.timingSafeEqual(digestBuffer, signatureBuffer)
      ) {
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const { event, payload } = req.body;

    // Payment Success Event
    if (event === 'payment_link.paid' || event === 'payment.captured') {
      const paymentLinkId = payload?.payment_link?.entity?.id;
      const orderId = payload?.payment?.entity?.order_id || payload?.payment_link?.entity?.reference_id;

      // Build the filter from the identifiers that are actually present —
      // Prisma silently ignores undefined values, which would otherwise turn
      // this into "match any bill".
      const orConditions = [];
      if (paymentLinkId) orConditions.push({ paymentLinkId });
      if (orderId) orConditions.push({ billNumber: orderId });

      if (orConditions.length === 0) {
        console.warn('Razorpay webhook carried no bill identifier; ignoring.');
        return res.status(200).json({ status: 'ok' });
      }

      const bill = await prisma.bill.findFirst({
        where: { OR: orConditions },
        select: { id: true },
      });

      if (bill) {
        // Shares the confirmation path with the browser callback, so the
        // deferred stock deduction happens exactly once whichever arrives first.
        const result = await confirmBillPayment(bill.id, {
          trackingMessage: 'Payment confirmed by the payment gateway.',
        });

        if (result && !result.alreadyPaid) {
          if (result.bill.customer?.phone) {
            await sendWhatsAppMessage(
              result.bill.customer.phone,
              `Payment Received ✅\n\nYour Order *${result.bill.billNumber}* is confirmed. We will notify you when it ships.`
            );
          }

          await sendOrderConfirmationNotifications(
            result.bill,
            `Your payment was successful and order ${result.bill.billNumber} has been confirmed!`
          );
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
