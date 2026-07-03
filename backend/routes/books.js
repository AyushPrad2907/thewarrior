const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getPreviewEpub,
  getFullEpub
} = require('../controllers/bookController');

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.get('/:id/preview', protect, getPreviewEpub);
router.get('/:id/full', protect, getFullEpub);
router.post('/', protect, adminOnly, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'previewEpub', maxCount: 1 },
  { name: 'fullEpub', maxCount: 1 }
]), createBook);
router.put('/:id', protect, adminOnly, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'previewEpub', maxCount: 1 },
  { name: 'fullEpub', maxCount: 1 }
]), updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
