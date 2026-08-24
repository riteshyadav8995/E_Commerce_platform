const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  getInventoryByProduct,
  initializeInventory,
  adjustStock,
  getStockHistory,
  updateInventorySettings,
} = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Inventory is back-office data. These routes were behind `authenticate` only,
// so any signed-in customer could read stock levels and adjust them at will.
router.use(authenticate);
router.use(authorize('Admin', 'Manager', 'Cashier'));

router.get('/', getAllInventory);
router.post('/initialize', initializeInventory);
router.get('/:productId', getInventoryByProduct);
router.get('/:productId/history', getStockHistory);
router.put('/:productId/adjust', adjustStock);
router.put('/:productId', updateInventorySettings);

module.exports = router;
