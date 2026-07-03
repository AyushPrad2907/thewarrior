const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getMyNetwork,
  getReferralStats,
  getReferralTree
} = require('../controllers/referralController');

router.get('/my-network', protect, getMyNetwork);
router.get('/stats', protect, getReferralStats);
router.get('/tree', protect, adminOnly, getReferralTree);

module.exports = router;
