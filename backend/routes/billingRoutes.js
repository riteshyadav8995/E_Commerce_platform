const express = require('express');
const router = express.Router();
const { createBill, getAllBills, getBillById, cancelBill, updateShippingStatus, verifyPayment, assignDeliveryBoy, getDeliveryTasks, trackOrderByBillNumber, getMyOrders, downloadInvoice, downloadPackingSlip, submitReturnRequest, getAllReturnRequests, updateReturnRequestStatus, exportOrdersCsv, markPaid } = require('../controllers/billingController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/verify-payment', verifyPayment);
router.get('/track/:billNumber', trackOrderByBillNumber);

router.use(authenticate);

router.get('/return-requests', getAllReturnRequests);
router.put('/return-requests/:id/status', updateReturnRequestStatus);

router.post('/return-request', upload.single('image'), submitReturnRequest);
router.get('/export/csv', exportOrdersCsv);
router.get('/invoice/:billNumber', downloadInvoice);
router.get('/packing-slip/:billNumber', downloadPackingSlip);
router.post('/', createBill);
router.get('/', getAllBills);
router.get('/my-orders', getMyOrders);
router.get('/delivery-tasks', getDeliveryTasks);
router.get('/:id', getBillById);
router.put('/:id/cancel', cancelBill);
router.put('/:id/mark-paid', markPaid);
router.patch('/:id/shipping', updateShippingStatus);
router.patch('/:id/assign-delivery', assignDeliveryBoy);

module.exports = router;
