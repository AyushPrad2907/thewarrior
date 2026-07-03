const Payment = require('../models/Payment');
const Book = require('../models/Book');
const User = require('../models/User');

// @desc    Submit payment
// @route   POST /api/payments
// @access  Private
exports.submitPayment = async (req, res) => {
  try {
    const { bookId, utrNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload payment screenshot'
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user already has a pending or approved payment for this book
    const existingPayment = await Payment.findOne({
      user: req.user._id,
      book: bookId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'You already have a payment submitted for this book'
      });
    }

    // Check if user already purchased this book
    const user = await User.findById(req.user._id);
    if (user.purchasedBooks.includes(bookId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already purchased this book'
      });
    }

    const payment = await Payment.create({
      user: req.user._id,
      book: bookId,
      amount: book.price,
      utrNumber,
      paymentScreenshot: req.file.path,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get user payments
// @route   GET /api/payments
// @access  Private
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('book', 'title author price coverImage')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('book')
      .populate('user', 'name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment or is admin
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Approve payment (Admin only)
// @route   PUT /api/payments/:id/approve
// @access  Private/Admin
exports.approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed'
      });
    }

    payment.status = 'approved';
    payment.verifiedAt = Date.now();
    payment.verifiedBy = req.user._id;

    await payment.save();

    // Add book to user's purchased books
    const user = await User.findById(payment.user);
    if (!user.purchasedBooks.includes(payment.book)) {
      user.purchasedBooks.push(payment.book);
      await user.save();
    }

    // Increment book purchase count
    const book = await Book.findById(payment.book);
    book.totalPurchases += 1;
    await book.save();

    res.json({
      success: true,
      message: 'Payment approved and book unlocked',
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Reject payment (Admin only)
// @route   PUT /api/payments/:id/reject
// @access  Private/Admin
exports.rejectPayment = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed'
      });
    }

    payment.status = 'rejected';
    payment.verifiedAt = Date.now();
    payment.verifiedBy = req.user._id;
    payment.rejectionReason = rejectionReason || 'Payment rejected by admin';

    await payment.save();

    res.json({
      success: true,
      message: 'Payment rejected',
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all payments (Admin only)
// @route   GET /api/payments/all
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const payments = await Payment.find(filter)
      .populate('book', 'title author price')
      .populate('user', 'name email phone')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
