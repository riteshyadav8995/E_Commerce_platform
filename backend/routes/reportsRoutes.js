const express = require('express');
const router = express.Router();
const { getDashboardStats, getAiSummary } = require('../controllers/reportsController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/ai-summary', getAiSummary);

module.exports = router;
