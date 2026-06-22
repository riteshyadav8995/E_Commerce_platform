const express = require('express');
const router = express.Router();
const { syncCart } = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/sync', authenticate, syncCart);

module.exports = router;
