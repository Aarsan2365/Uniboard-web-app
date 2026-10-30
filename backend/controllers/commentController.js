const mongoose = require('mongoose');
const { Comment, Notice } = require('../models');
const { audienceFilter } = require('../middlewares/noticeAccess');
const AppError = require('../utils/AppError');

const findNotice = async (req, id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return Notice.findOne({ _id: id, ...audienceFilter(req.user) });
};
const serialize = comment => {
  const obj = comment.toJSON();
  obj.author = obj.userId;
  delete obj.userId;
  return obj;
};
const getCommentsForNotice = async (req, res, next) => {
  try {
    const notice = await findNotice(req, req.params.noticeId);
    if (!notice) return next(new AppError('Notice not found.', 404));
    const comments = await Comment.find({ noticeId: notice.id })
      .sort({ createdAt: 1 }).populate('userId', 'name role');
    res.json(comments.map(serialize));
  } catch (error) { next(error); }
};
const createComment = async (req, res, next) => {
  try {
    const notice = await findNotice(req, req.params.noticeId);
    if (!notice) return next(new AppError('Notice not found.', 404));
    const comment = await Comment.create({ body: req.body.body, noticeId: notice.id, userId: req.user.id });
    await comment.populate('userId', 'name role');
    res.status(201).json(serialize(comment));
  } catch (error) { next(error); }
};
const deleteComment = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Comment not found.', 404));
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(new AppError('Comment not found.', 404));
    const notice = await findNotice(req, comment.noticeId);
    if (!notice) return next(new AppError('Notice not found.', 404));
    if (req.user.role !== 'admin' && comment.userId.toString() !== req.user.id) {
      return next(new AppError('You can only delete your own comments.', 403));
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted.' });
  } catch (error) { next(error); }
};
module.exports = { getCommentsForNotice, createComment, deleteComment };
