const prisma = require('../utils/prisma');

// ─── POST /api/feedback ────────────────────────────────────────────────────────
const submitFeedback = async (req, res) => {
  try {
    const { billNumber, rating, message } = req.body;

    if (!billNumber || !rating) {
      return res.status(400).json({ message: 'Bill number and rating are required.' });
    }

    const bill = await prisma.bill.findUnique({
      where: { billNumber },
      include: { feedback: true }
    });

    if (!bill) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (bill.feedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this order.' });
    }

    if (bill.shippingStatus !== 'DELIVERED') {
      return res.status(400).json({ message: 'Cannot submit feedback before order is delivered.' });
    }

    const feedback = await prisma.deliveryFeedback.create({
      data: {
        billId: bill.id,
        rating: parseInt(rating),
        message: message || null
      }
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitFeedback };
