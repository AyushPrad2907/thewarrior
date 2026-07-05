const Book = require('../models/Book');
const User = require('../models/User');
const upload = require('../middleware/upload');

const normalizeUploadPath = (filePath) => filePath.replace(/^uploads[\\/]+/, '').replace(/^\\+/, '');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({ isActive: true }).sort({ createdAt: -1 });
    
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

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Create new book (Admin only)
// @route   POST /api/books
// @access  Private/Admin
exports.createBook = async (req, res) => {
  try {
    const { title, description, author, price, category } = req.body;

    if (!req.files || !req.files.coverImage || !req.files.previewEpub || !req.files.fullEpub) {
      return res.status(400).json({
        success: false,
        message: 'Please provide cover image, preview EPUB, and full EPUB'
      });
    }

    const book = await Book.create({
      title,
      description,
      author,
      price,
      category,
      coverImage: normalizeUploadPath(req.files.coverImage[0].path),
      previewEpub: normalizeUploadPath(req.files.previewEpub[0].path),
      fullEpub: normalizeUploadPath(req.files.fullEpub[0].path),
      qrCodeImage: req.files.qrCodeImage ? normalizeUploadPath(req.files.qrCodeImage[0].path) : ''
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update book (Admin only)
// @route   PUT /api/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const { title, description, author, price, category, isActive } = req.body;

    if (title) book.title = title;
    if (description) book.description = description;
    if (author) book.author = author;
    if (price !== undefined) book.price = price;
    if (category) book.category = category;
    if (isActive !== undefined) book.isActive = isActive;

    if (req.files) {
      if (req.files.coverImage) book.coverImage = normalizeUploadPath(req.files.coverImage[0].path);
      if (req.files.previewEpub) book.previewEpub = normalizeUploadPath(req.files.previewEpub[0].path);
      if (req.files.fullEpub) book.fullEpub = normalizeUploadPath(req.files.fullEpub[0].path);
      if (req.files.qrCodeImage) book.qrCodeImage = normalizeUploadPath(req.files.qrCodeImage[0].path);
    }

    await book.save();

    res.json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete book (Admin only)
// @route   DELETE /api/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    await book.deleteOne();

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get preview EPUB
// @route   GET /api/books/:id/preview
// @access  Private
exports.getPreviewEpub = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      epubUrl: `/uploads/${book.previewEpub.replace(/^uploads[\\/]+/, '')}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get full EPUB (Purchased users only)
// @route   GET /api/books/:id/full
// @access  Private
exports.getFullEpub = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user has purchased this book
    if (!user.purchasedBooks.includes(book._id)) {
      return res.status(403).json({
        success: false,
        message: 'You have not purchased this book'
      });
    }

    res.json({
      success: true,
      epubUrl: `/uploads/${book.fullEpub.replace(/^uploads[\\/]+/, '')}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
