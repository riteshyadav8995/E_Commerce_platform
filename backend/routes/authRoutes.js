const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, logoutUser, sendOtp, verifyOtp } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', authenticate, getProfile);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;
