const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticate, authorize('Admin', 'Manager'), upload.single('image'), createCategory);
router.put('/:id', authenticate, authorize('Admin', 'Manager'), upload.single('image'), updateCategory);
router.delete('/:id', authenticate, authorize('Admin'), deleteCategory);

module.exports = router;
