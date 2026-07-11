const User = require('../models/User');
const Payment = require('../models/Payment');

const REFERRAL_COMMISSION_RATE = 0.1;

// Helper: always compute referral link dynamically from env
const buildReferralLink = (referralCode) => {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
  return `${frontendUrl}/signup?ref=${referralCode}`;
};

// @desc    Get user's referral network
// @route   GET /api/referrals/my-network
// @access  Private
exports.getMyNetwork = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get direct referrals (first level)
    const directReferrals = await User.find({ parentUserId: req.user._id })
      .select('name email referralCode createdAt purchasedBooks')
      .sort({ createdAt: -1 });

    // Get second level referrals
    const directReferralIds = directReferrals.map(r => r._id);
    const secondLevelReferrals = await User.find({ parentUserId: { $in: directReferralIds } })
      .select('name email referralCode createdAt purchasedBooks parentUserId')
      .sort({ createdAt: -1 });

    // Get book purchase status for referrals
    const directReferralsWithStatus = await Promise.all(
      directReferrals.map(async (referral) => {
        const payments = await Payment.find({ user: referral._id, status: 'approved' });
        return {
          ...referral._doc,
          totalPurchases: payments.length
        };
      })
    );

    const secondLevelReferralsWithStatus = await Promise.all(
      secondLevelReferrals.map(async (referral) => {
        const payments = await Payment.find({ user: referral._id, status: 'approved' });
        return {
          ...referral._doc,
          totalPurchases: payments.length
        };
      })
    );

    const weeklyStart = new Date();
    weeklyStart.setDate(weeklyStart.getDate() - 7);

    const weeklyPayments = await Payment.find({
      user: { $in: directReferralIds },
      status: 'approved',
      verifiedAt: { $gte: weeklyStart }
    })
      .populate('user', 'name email referralCode')
      .populate('book', 'title price')
      .sort({ verifiedAt: -1 });

    const weeklyCommissionEntries = weeklyPayments.map((payment) => {
      const commission = payment.amount * REFERRAL_COMMISSION_RATE;

      return {
        paymentId: payment._id,
        referralId: payment.user._id,
        referralName: payment.user.name,
        referralEmail: payment.user.email,
        referralCode: payment.user.referralCode,
        bookTitle: payment.book?.title || 'Book',
        saleAmount: payment.amount,
        commission,
        verifiedAt: payment.verifiedAt
      };
    });

    const weeklyCommissionTotal = weeklyCommissionEntries.reduce((total, entry) => total + entry.commission, 0);
    const weeklySalesTotal = weeklyCommissionEntries.reduce((total, entry) => total + entry.saleAmount, 0);

    res.json({
      success: true,
      referralCode: user.referralCode,
      referralLink: buildReferralLink(user.referralCode),
      directReferrals: directReferralsWithStatus,
      secondLevelReferrals: secondLevelReferralsWithStatus,
      stats: {
        directCount: directReferrals.length,
        secondLevelCount: secondLevelReferrals.length,
        totalNetwork: directReferrals.length + secondLevelReferrals.length,
        weeklyCommission: weeklyCommissionTotal,
        weeklySales: weeklySalesTotal,
        weeklyCommissionRate: REFERRAL_COMMISSION_RATE,
        weeklyCommissionCount: weeklyCommissionEntries.length
      },
      weeklyCommissionEntries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get referral statistics
// @route   GET /api/referrals/stats
// @access  Private
exports.getReferralStats = async (req, res) => {
  try {
    const directReferrals = await User.countDocuments({ parentUserId: req.user._id });
    
    const directReferralDocs = await User.find({ parentUserId: req.user._id }).select('_id');
    const directReferralIds = directReferralDocs.map(r => r._id);
    
    const secondLevelReferrals = await User.countDocuments({ 
      parentUserId: { $in: directReferralIds } 
    });

    res.json({
      success: true,
      stats: {
        directCount: directReferrals,
        secondLevelCount: secondLevelReferrals,
        totalNetwork: directReferrals + secondLevelReferrals
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get full referral tree (Admin only)
// @route   GET /api/referrals/tree
// @access  Private/Admin
exports.getReferralTree = async (req, res) => {
  try {
    const { userId } = req.query;
    
    let startUser;
    if (userId) {
      startUser = await User.findById(userId);
    } else {
      // Get all root users (no parent)
      startUser = { _id: null, name: 'Root', referralCode: 'ROOT' };
    }

    const buildTree = async (parentId, level = 0) => {
      if (level > 5) return []; // Limit depth to prevent infinite loops

      const users = await User.find({ parentUserId: parentId })
        .select('name email referralCode createdAt purchasedBooks')
        .sort({ createdAt: -1 });

      const tree = await Promise.all(
        users.map(async (user) => {
          const children = await buildTree(user._id, level + 1);
          return {
            ...user._doc,
            children,
            level
          };
        })
      );

      return tree;
    };

    let tree;
    if (userId) {
      tree = await buildTree(userId);
    } else {
      // Get all root users
      const rootUsers = await User.find({ parentUserId: null })
        .select('name email referralCode createdAt purchasedBooks')
        .sort({ createdAt: -1 });

      tree = await Promise.all(
        rootUsers.map(async (user) => {
          const children = await buildTree(user._id, 1);
          return {
            ...user._doc,
            children,
            level: 0
          };
        })
      );
    }

    res.json({
      success: true,
      tree
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
