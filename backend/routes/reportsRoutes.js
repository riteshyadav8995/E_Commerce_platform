const express = require('express');
const router = express.Router();
const { getDashboardStats, getAiSummary } = require('../controllers/reportsController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Revenue reporting was readable by any signed-in customer.
router.use(authenticate);
router.use(authorize('Admin', 'Manager', 'Cashier'));

router.get('/dashboard', getDashboardStats);
router.get('/ai-summary', getAiSummary);

module.exports = router;
