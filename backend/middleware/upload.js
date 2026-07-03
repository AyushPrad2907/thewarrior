const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'coverImage') {
      uploadPath += 'covers/';
    } else if (file.fieldname === 'previewEpub') {
      uploadPath += 'previews/';
    } else if (file.fieldname === 'fullEpub') {
      uploadPath += 'fullbooks/';
    } else if (file.fieldname === 'paymentScreenshot') {
      uploadPath += 'screenshots/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverImage') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Cover image must be an image file'), false);
    }
  } else if (file.fieldname === 'previewEpub' || file.fieldname === 'fullEpub') {
    if (file.mimetype === 'application/epub+zip' || file.mimetype === 'application/zip' || file.originalname.endsWith('.epub')) {
      cb(null, true);
    } else {
      cb(new Error('EPUB file must be .epub format'), false);
    }
  } else if (file.fieldname === 'paymentScreenshot') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Payment screenshot must be an image file'), false);
    }
  } else {
    cb(new Error('Unknown file field'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

module.exports = upload;
