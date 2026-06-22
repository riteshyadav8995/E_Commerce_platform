const express = require('express');
const router = express.Router();
const { handleRazorpayWebhook } = require('../controllers/razorpayController');

router.post('/webhook', handleRazorpayWebhook);

module.exports = router;
