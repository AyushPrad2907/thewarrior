const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  submitPayment,
  getUserPayments,
  getPaymentById,
  approvePayment,
  rejectPayment,
  getAllPayments
} = require('../controllers/paymentController');

router.post('/', protect, upload.single('paymentScreenshot'), submitPayment);
router.get('/', protect, getUserPayments);
router.get('/all', protect, adminOnly, getAllPayments);
router.get('/:id', protect, getPaymentById);
router.put('/:id/approve', protect, adminOnly, approvePayment);
router.put('/:id/reject', protect, adminOnly, rejectPayment);

module.exports = router;
