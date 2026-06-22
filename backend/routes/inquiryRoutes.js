const express = require('express');
const router = express.Router();
const { sendInquiryEmail } = require('../services/emailService');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    await sendInquiryEmail(name, email, phone, message);

    res.status(200).json({ success: true, message: 'Inquiry sent successfully' });
  } catch (error) {
    console.error('Inquiry endpoint error:', error);
    res.status(500).json({ message: 'Server error processing inquiry' });
  }
});

module.exports = router;
