const express = require('express');
const router = express.Router();
const { verifyWebhook, handleIncomingMessage } = require('../controllers/whatsappController');

router.get('/webhook', verifyWebhook);
router.post('/webhook', handleIncomingMessage);

module.exports = router;
