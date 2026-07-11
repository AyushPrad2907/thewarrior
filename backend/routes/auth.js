const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  signup,
  login,
  getMe,
  logout,
  addUpiId,
  deleteUpiId
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/upi-ids', protect, addUpiId);
router.post('/upi-ids/delete', protect, deleteUpiId);

module.exports = router;
