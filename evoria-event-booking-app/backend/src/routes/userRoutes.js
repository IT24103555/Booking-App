const express = require('express');
const {
  getAllUsers,
  getProfile,
  updateProfile,
  getSingleUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Profile routes (any logged in user)
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

// Admin-only user management
router.get('/', protect, authorizeRoles('admin'), getAllUsers);
router.get('/:id', protect, authorizeRoles('admin'), getSingleUser);
router.put('/:id', protect, authorizeRoles('admin'), updateUser);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);

module.exports = router;
