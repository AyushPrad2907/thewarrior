const User = require('../models/User');
const Book = require('../models/Book');
const Payment = require('../models/Payment');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search 
      ? { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(query)
      .select('-password')
      .populate('purchasedBooks', 'title author price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('purchasedBooks', 'title author price coverImage');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, isActive, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    if (role && (role === 'user' || role === 'admin')) user.role = role;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has children referrals
    const childUsers = await User.countDocuments({ parentUserId: user._id });
    if (childUsers > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active referrals'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments({ isActive: true });
    const totalPayments = await Payment.countDocuments();
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const approvedPayments = await Payment.countDocuments({ status: 'approved' });
    const rejectedPayments = await Payment.countDocuments({ status: 'rejected' });

    // Calculate total revenue
    const approvedPaymentDocs = await Payment.find({ status: 'approved' });
    const totalRevenue = approvedPaymentDocs.reduce((sum, payment) => sum + payment.amount, 0);

    // Get recent activity
    const recentUsers = await User.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Payment.find()
      .populate('user', 'name email')
      .populate('book', 'title price')
      .sort({ submittedAt: -1 })
      .limit(5);

    // Get top performing books
    const topBooks = await Book.find({ isActive: true })
      .sort({ totalPurchases: -1 })
      .limit(5);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalBooks,
        totalPayments,
        pendingPayments,
        approvedPayments,
        rejectedPayments,
        totalRevenue,
        recentUsers,
        recentPayments,
        topBooks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all books for admin
// @route   GET /api/admin/books
// @access  Private/Admin
exports.getAllBooksAdmin = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
