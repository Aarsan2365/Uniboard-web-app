const { Comment, Notice } = require('../models');
const AppError = require('../utils/AppError');

const getCommentsForNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.noticeId);
    if (!notice) return next(new AppError('Notice not found.', 404));

    const comments = await Comment.find({ noticeId: notice._id })
      .populate('userId', 'name role')
      .sort({ createdAt: 1 });

    const data = comments.map((comment) => {
      const obj = comment.toJSON();
      obj.author = obj.userId;
      delete obj.userId;
      return obj;
    });

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const createComment = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.noticeId);
    if (!notice) return next(new AppError('Notice not found.', 404));

    const comment = await Comment.create({
      body: req.body.body,
      noticeId: notice._id,
      userId: req.user.id,
    });

    await comment.populate('userId', 'name role');
    const data = comment.toJSON();
    data.author = data.userId;
    delete data.userId;

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(new AppError('Comment not found.', 404));

    const isOwner = comment.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return next(new AppError('You can only delete your own comments.', 403));

    await comment.deleteOne();
    res.status(200).json({ message: 'Comment deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCommentsForNotice, createComment, deleteComment };
