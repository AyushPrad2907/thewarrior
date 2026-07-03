const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  author: {
    type: String,
    required: [true, 'Please provide an author name'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  coverImage: {
    type: String,
    required: [true, 'Please provide a cover image']
  },
  previewEpub: {
    type: String,
    required: [true, 'Please provide a preview EPUB file']
  },
  fullEpub: {
    type: String,
    required: [true, 'Please provide a full EPUB file']
  },
  category: {
    type: String,
    enum: ['fiction', 'non-fiction', 'self-help', 'business', 'technology', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);
