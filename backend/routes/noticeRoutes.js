// routes/noticeRoutes.js
//
// This file is a good one to walk through in your viva: it shows,
// route by route, exactly which roles can do what, and which
// middleware runs before the controller (auth → validation → upload → handler).

const express = require('express');
const router = express.Router();
const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  markAsRead,
  getReadReceipts,
  getUnreadCount,
} = require('../controllers/noticeController');
const {
  getCommentsForNotice,
  createComment,
} = require('../controllers/commentController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { noticeValidator, commentValidator, paginationValidator } = require('../middlewares/validators');
const upload = require('../middlewares/upload');

// Any logged-in user (admin or student) can browse and filter notices.
router.get('/', protect, paginationValidator, getNotices);
router.get('/unread-count', protect, getUnreadCount);
router.get('/:id', protect, getNoticeById);

// Only admins can create, edit, or delete notices. `upload.single('image')`
// runs first so multer parses the multipart form before validators/
// controllers touch req.body.
router.post('/', protect, restrictTo('admin'), upload.single('image'), noticeValidator, createNotice);
router.put('/:id', protect, restrictTo('admin'), upload.single('image'), noticeValidator, updateNotice);
router.delete('/:id', protect, restrictTo('admin'), deleteNotice);

// Read receipts / notifications
router.post('/:id/read', protect, markAsRead);
router.get('/:id/reads', protect, restrictTo('admin'), getReadReceipts);

// Comments, nested under a notice
router.get('/:noticeId/comments', protect, getCommentsForNotice);
router.post('/:noticeId/comments', protect, commentValidator, createComment);

module.exports = router;
