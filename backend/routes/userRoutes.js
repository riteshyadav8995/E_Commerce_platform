const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', authenticate, authorize('Admin'), getUsers);
router.post('/', authenticate, authorize('Admin'), createUser);
router.put('/:id', authenticate, updateUser);

module.exports = router;
