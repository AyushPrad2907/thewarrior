const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAnalytics,
  getAllBooksAdmin
} = require('../controllers/adminController');

router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUserById);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.get('/books', protect, adminOnly, getAllBooksAdmin);

module.exports = router;
