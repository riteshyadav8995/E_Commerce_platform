const express = require('express');
const router = express.Router();
const { createBill, getAllBills, getBillById, cancelBill, updateShippingStatus, verifyPayment, assignDeliveryBoy, getDeliveryTasks, trackOrderByBillNumber, getMyOrders, downloadInvoice, downloadPackingSlip, submitReturnRequest, getAllReturnRequests, updateReturnRequestStatus, exportOrdersCsv, markPaid } = require('../controllers/billingController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Staff = anyone who works the back office. Customers must never reach these.
// Several of the routes below previously sat behind `authenticate` alone,
// which let any signed-in customer list every order, export the full customer
// CSV, cancel other people's orders and approve their own refunds.
const STAFF = ['Admin', 'Manager', 'Cashier'];
const staffOnly = authorize(...STAFF);
const staffOrDelivery = authorize(...STAFF, 'DeliveryBoy');

// ─── Public ───────────────────────────────────────────────────────────
router.post('/verify-payment', verifyPayment);
router.get('/track/:billNumber', trackOrderByBillNumber);

router.use(authenticate);

// ─── Literal paths first: `/:id` below would otherwise swallow them ───
router.get('/return-requests', staffOnly, getAllReturnRequests);
router.put('/return-requests/:id/status', staffOnly, updateReturnRequestStatus);
router.post('/return-request', upload.single('image'), submitReturnRequest);

router.get('/export/csv', staffOnly, exportOrdersCsv);
router.get('/invoice/:billNumber', downloadInvoice);
router.get('/packing-slip/:billNumber', downloadPackingSlip);

router.get('/my-orders', getMyOrders);
router.get('/delivery-tasks', staffOrDelivery, getDeliveryTasks);

router.post('/', createBill);
router.get('/', staffOnly, getAllBills);

// ─── Parameterised paths last ─────────────────────────────────────────
router.get('/:id', staffOrDelivery, getBillById);
router.put('/:id/cancel', staffOnly, cancelBill);
router.put('/:id/mark-paid', staffOnly, markPaid);
router.patch('/:id/shipping', staffOrDelivery, updateShippingStatus);
router.patch('/:id/assign-delivery', staffOnly, assignDeliveryBoy);

module.exports = router;
