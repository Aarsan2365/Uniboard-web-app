// routes/commentRoutes.js
//
// GET/POST for comments are nested under notices (see
// routes/noticeRoutes.js: /api/notices/:noticeId/comments) since you
// need to know which notice you're commenting on. DELETE only needs
// the comment's own id, so it gets its own flat route here, mounted
// at /api/comments in server.js.

const express = require('express');
const router = express.Router();
const { deleteComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

// Ownership/role check (author or admin) happens inside the controller,
// since it depends on data (the comment's userId) that middleware
// alone can't see without an extra query.
router.delete('/:id', protect, deleteComment);

module.exports = router;
