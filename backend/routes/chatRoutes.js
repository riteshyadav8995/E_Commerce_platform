const express = require('express');
const router = express.Router();
const { chatWithAgent } = require('../controllers/chatController');

router.post('/', chatWithAgent);

module.exports = router;
