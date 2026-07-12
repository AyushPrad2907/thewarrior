const User = require('../models/User');
const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');

// Helper: always compute referral link dynamically from env — never trust stored value
const buildReferralLink = (referralCode) => {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
  return `${frontendUrl}/signup?ref=${referralCode}`;
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Find parent user if referral code provided
    let parentUser = null;
    if (referralCode) {
      parentUser = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (!parentUser) {
        return res.status(400).json({
          success: false,
          message: 'Invalid referral code'
        });
      }
    }

    // Generate unique referral code for new user
    let newReferralCode;
    let isUnique = false;
    while (!isUnique) {
      newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingCode = await User.findOne({ referralCode: newReferralCode });
      if (!existingCode) {
        isUnique = true;
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      upiIds: [],
      referralCode: newReferralCode,
      referralLink: buildReferralLink(newReferralCode),
      parentUserId: parentUser ? parentUser._id : null
    });

    // Generate token
    const token = generateToken(user._id, 'user');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        upiIds: user.upiIds,
        referralCode: user.referralCode,
        referralLink: buildReferralLink(user.referralCode),
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during signup'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if it's admin login
    const admin = await Admin.findOne({ email }).select('+password');
    if (admin) {
      const isMatch = await admin.matchPassword(password);
      if (isMatch) {
        const token = generateToken(admin._id, 'admin');
        return res.json({
          success: true,
          message: 'Admin login successful',
          token,
          user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: 'admin'
          }
        });
      }
    }

    // Check user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id, 'user');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        upiIds: user.upiIds || [],
        referralCode: user.referralCode,
        referralLink: buildReferralLink(user.referralCode),
        role: user.role,
        purchasedBooks: user.purchasedBooks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    let userData;
    if (req.user.role === 'admin') {
      const admin = await Admin.findById(req.user._id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }
      userData = {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      };
    } else {
      const user = await User.findById(req.user._id).populate('purchasedBooks');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        upiIds: user.upiIds || [],
        referralCode: user.referralCode,
        referralLink: buildReferralLink(user.referralCode),
        role: user.role,
        purchasedBooks: user.purchasedBooks,
        paymentStatus: user.paymentStatus,
        createdAt: user.createdAt
      };
    }

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Add a UPI ID to current user
// @route   POST /api/auth/upi-ids
// @access  Private
exports.addUpiId = async (req, res) => {
  try {
    const { upiId } = req.body;
    if (!upiId || !upiId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid UPI ID'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has 3 UPI IDs
    if (user.upiIds && user.upiIds.length >= 3) {
      return res.status(400).json({
        success: false,
        message: 'You can have a maximum of 3 UPI IDs'
      });
    }

    // Check if the UPI ID already exists in the user's list
    const trimmedUpi = upiId.trim();
    if (user.upiIds && user.upiIds.includes(trimmedUpi)) {
      return res.status(400).json({
        success: false,
        message: 'This UPI ID is already added'
      });
    }

    // Add to list
    if (!user.upiIds) {
      user.upiIds = [];
    }
    user.upiIds.push(trimmedUpi);
    await user.save();

    res.json({
      success: true,
      message: 'UPI ID added successfully',
      upiIds: user.upiIds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding UPI ID'
    });
  }
};

// @desc    Delete a UPI ID from current user
// @route   POST /api/auth/upi-ids/delete
// @access  Private
exports.deleteUpiId = async (req, res) => {
  try {
    const { upiId } = req.body;
    if (!upiId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the UPI ID to delete'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Ensure they have at least one UPI ID left
    if (!user.upiIds || user.upiIds.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'You must keep at least one UPI ID'
      });
    }

    const trimmedUpi = upiId.trim();
    if (!user.upiIds.includes(trimmedUpi)) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID not found in your list'
      });
    }

    // Filter out the UPI ID
    user.upiIds = user.upiIds.filter(id => id !== trimmedUpi);
    await user.save();

    res.json({
      success: true,
      message: 'UPI ID deleted successfully',
      upiIds: user.upiIds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting UPI ID'
    });
  }
};
