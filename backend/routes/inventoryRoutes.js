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
const { authenticate } = require('../middleware/authMiddleware');

// All inventory routes require authentication
router.use(authenticate);

router.get('/', getAllInventory);
router.get('/:productId', getInventoryByProduct);
router.get('/:productId/history', getStockHistory);
router.post('/initialize', initializeInventory);
router.put('/:productId/adjust', adjustStock);
router.put('/:productId', updateInventorySettings);

module.exports = router;
