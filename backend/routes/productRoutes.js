const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  generateDescription,
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getAllProducts);
router.post('/generate-description', authenticate, authorize('Admin', 'Manager'), generateDescription);
router.get('/:id', getProductById);
router.post('/', authenticate, authorize('Admin', 'Manager'), createProduct);
router.put('/:id', authenticate, authorize('Admin', 'Manager'), updateProduct);
router.delete('/:id', authenticate, authorize('Admin'), deleteProduct);

module.exports = router;
