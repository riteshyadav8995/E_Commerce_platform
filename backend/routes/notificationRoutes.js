const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// The notification feed carries operational alerts (low stock, etc.) meant for
// staff only — it is not per-customer data.
router.use(authenticate);
router.use(authorize('Admin', 'Manager', 'Cashier'));

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;
