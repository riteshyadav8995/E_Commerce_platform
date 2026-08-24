const prisma = require('../utils/prisma');

/**
 * Marks a bill as paid and applies the stock deduction that was deferred
 * while payment was pending.
 *
 * This used to be copy-pasted into verifyPayment, markPaid and the Razorpay
 * webhook. The webhook's copy had drifted and never deducted stock at all, so
 * webhook-confirmed orders shipped without ever leaving inventory.
 *
 * Returns { bill, modifiedInventoryIds, alreadyPaid }. When the bill was
 * already PAID nothing is written and alreadyPaid is true, which keeps the
 * operation idempotent — the webhook and the browser callback routinely both
 * fire for the same payment.
 */
const confirmBillPayment = async (billId, { reason, userId = null, trackingMessage } = {}) => {
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: {
      customer: true,
      user: true,
      items: {
        include: {
          product: { include: { inventories: { orderBy: { quantity: 'desc' }, take: 1 } } },
        },
      },
    },
  });

  if (!bill) return null;

  if (bill.paymentStatus === 'PAID') {
    return { bill, modifiedInventoryIds: [], alreadyPaid: true };
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedBill = await tx.bill.update({
      where: { id: bill.id },
      data: { paymentStatus: 'PAID', status: 'PAID' },
      include: {
        customer: true,
        user: true,
        items: { include: { product: true } },
      },
    });

    const modifiedInventoryIds = [];
    for (const item of bill.items) {
      const mainInventory = item.product.inventories?.[0];
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
          reason: reason || `Sale — ${bill.billNumber}`,
          userId,
        },
      });

      modifiedInventoryIds.push(mainInventory.id);
    }

    await tx.orderTracking.create({
      data: {
        billId: bill.id,
        status: 'Payment Received',
        message: trackingMessage || 'Payment has been successfully verified.',
      },
    });

    return { updatedBill, modifiedInventoryIds };
  });

  const { checkAndNotifyLowStock } = require('./inventoryService');
  for (const invId of result.modifiedInventoryIds) {
    await checkAndNotifyLowStock(invId);
  }

  return {
    bill: result.updatedBill,
    modifiedInventoryIds: result.modifiedInventoryIds,
    alreadyPaid: false,
  };
};

/**
 * Best-effort invoice email + WhatsApp confirmation. Never throws: a failing
 * mail server must not roll back a payment that already succeeded.
 */
const sendOrderConfirmationNotifications = async (bill, introLine) => {
  try {
    const recipient = bill.user;
    if (!recipient) return;

    if (recipient.email) {
      const { generateBillPDF } = require('./pdfService');
      const { sendBillEmail } = require('./emailService');
      const pdfBuffer = await generateBillPDF(bill);
      await sendBillEmail(recipient.email, bill.billNumber, pdfBuffer, recipient.name);
    }

    if (recipient.phone) {
      const { sendWhatsAppMessage } = require('./whatsappService');
      const line = introLine || `Your order ${bill.billNumber} has been confirmed!`;
      const message = `Hello ${recipient.name},\n\n${line}\nTotal Amount: ₹${bill.grandTotal}\n\nThank you for shopping with LuxeStore!`;
      await sendWhatsAppMessage(recipient.phone, message);
    }
  } catch (error) {
    console.error('Failed to send order confirmation notifications:', error);
  }
};

module.exports = { confirmBillPayment, sendOrderConfirmationNotifications };
