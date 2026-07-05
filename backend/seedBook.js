require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Book = require('./models/Book');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/THE_WARRIOR';

const rootDir = __dirname;
const publicCoverPath = path.join(rootDir, '..', 'frontend', 'public', 'book-cover.jpg');
const coverDestinationPath = path.join(rootDir, 'uploads', 'covers', 'book-cover.jpg');

const bookData = {
  title: 'The Warrior In You',
  description: 'A focused motivational ebook designed to push the reader into action and turn intention into momentum.',
  author: 'Ayush Pradhan',
  price: 300,
  category: 'self-help',
  coverImage: 'uploads/covers/book-cover.jpg',
  previewEpub: 'uploads/previews/preview.pdf',
  fullEpub: 'uploads/fullbooks/full book.pdf',
  qrCodeImage: 'uploads/qrcode/payment-qr.jpg',
  isActive: true
};

const ensureDirectoriesExist = () => {
  const directories = [
    path.join(rootDir, 'uploads', 'covers'),
    path.join(rootDir, 'uploads', 'previews'),
    path.join(rootDir, 'uploads', 'fullbooks'),
    path.join(rootDir, 'uploads', 'qrcode')
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
  
  if (fs.existsSync(publicCoverPath) && !fs.existsSync(coverDestinationPath)) {
    fs.copyFileSync(publicCoverPath, coverDestinationPath);
    console.log('Copied cover image into backend/uploads/covers');
  }
};

const seedBook = async () => {
  try {
    ensureDirectoriesExist();

    await mongoose.connect(MONGODB_URI);

    const existingBook = await Book.findOne({ title: bookData.title });

    if (existingBook) {
      await Book.updateOne({ _id: existingBook._id }, { $set: bookData });
      console.log('Updated existing featured book');
    } else {
      await Book.create(bookData);
      console.log('Created featured book');
    }

    console.log('Seeded book files:');
    console.log(`Cover: ${bookData.coverImage}`);
    console.log(`Preview EPUB: ${bookData.previewEpub}`);
    console.log(`Full EPUB: ${bookData.fullEpub}`);
    console.log(`QR Code: ${bookData.qrCodeImage}`);
  } catch (error) {
    console.error('Failed to seed book:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedBook();