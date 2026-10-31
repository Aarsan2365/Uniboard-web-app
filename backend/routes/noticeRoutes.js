const express = require('express');
const router = express.Router();
const {
  getNotices, getNoticeById, getNoticePdf, createNotice, updateNotice, deleteNotice,
  markAsRead, getReadReceipts, getUnreadCount, getUpcomingEvents
} = require('../controllers/noticeController');
const { getSavedNotices, saveNotice, unsaveNotice } = require('../controllers/savedNoticeController');
const { getCommentsForNotice, createComment } = require('../controllers/commentController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { noticeValidator, commentValidator, paginationValidator } = require('../middlewares/validators');
const upload = require('../middlewares/upload');
const { cleanupRejectedUpload, validatePdfUpload } = require('../utils/uploadFiles');
const { persistAttachments } = require('../utils/attachmentStore');
const noticeAttachments = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]);

router.use(protect);
router.get('/', paginationValidator, getNotices);
router.get('/unread-count', getUnreadCount);
router.get('/saved', getSavedNotices);
router.get('/events/upcoming', getUpcomingEvents);
router.post('/', restrictTo('admin'), cleanupRejectedUpload, noticeAttachments, validatePdfUpload, noticeValidator, persistAttachments, createNotice);
router.get('/:id/pdf', getNoticePdf);
router.get('/:id', getNoticeById);
router.put('/:id', restrictTo('admin'), cleanupRejectedUpload, noticeAttachments, validatePdfUpload, noticeValidator, persistAttachments, updateNotice);
router.delete('/:id', restrictTo('admin'), deleteNotice);
router.post('/:id/save', saveNotice);
router.delete('/:id/save', unsaveNotice);
router.post('/:id/read', markAsRead);
router.get('/:id/reads', restrictTo('admin'), getReadReceipts);
router.get('/:noticeId/comments', getCommentsForNotice);
router.post('/:noticeId/comments', commentValidator, createComment);
module.exports = router;
