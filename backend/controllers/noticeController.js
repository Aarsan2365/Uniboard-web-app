const mongoose = require('mongoose');
const { Notice, User, NoticeRead, Comment } = require('../models');
const AppError = require('../utils/AppError');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getNotices = async (req, res, next) => {
  try {
    const { category, search, targetBatch } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (category) filter.category = category;
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: regex }, { body: regex }];
    }

    if (req.user.role !== 'admin') {
      const fullUser = await User.findById(req.user.id).select('batch');
      const userBatch = fullUser?.batch || 'N/A';
      if (targetBatch && (targetBatch === 'All' || targetBatch === userBatch)) {
        filter.targetBatch = targetBatch;
      } else {
        filter.targetBatch = { $in: ['All', userBatch] };
      }
    } else if (targetBatch) {
      filter.targetBatch = targetBatch;
    }

    const [count, rows] = await Promise.all([
      Notice.countDocuments(filter),
      Notice.find(filter)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const noticeIds = rows.map((n) => n._id);
    const reads = await NoticeRead.find({ userId: req.user.id, noticeId: { $in: noticeIds } }).select('noticeId');
    const readIds = new Set(reads.map((r) => r.noticeId.toString()));

    const notices = rows.map((notice) => {
      const obj = notice.toJSON();
      obj.author = obj.createdBy;
      delete obj.createdBy;
      obj.isRead = readIds.has(notice._id.toString());
      return obj;
    });

    res.status(200).json({
      data: notices,
      meta: { total: count, page, pages: Math.ceil(count / limit), limit },
    });
  } catch (err) {
    next(err);
  }
};

const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate('createdBy', 'name');
    if (!notice) return next(new AppError('Notice not found.', 404));

    const obj = notice.toJSON();
    obj.author = obj.createdBy;
    delete obj.createdBy;
    res.status(200).json(obj);
  } catch (err) {
    next(err);
  }
};

const createNotice = async (req, res, next) => {
  try {
    const { title, body, category, targetBatch } = req.body;
    const notice = await Notice.create({
      title,
      body,
      category,
      targetBatch: targetBatch || 'All',
      createdBy: req.user.id,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });
    res.status(201).json(notice);
  } catch (err) {
    next(err);
  }
};

const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return next(new AppError('Notice not found.', 404));

    const { title, body, category, targetBatch } = req.body;
    if (title !== undefined) notice.title = title;
    if (body !== undefined) notice.body = body;
    if (category !== undefined) notice.category = category;
    if (targetBatch !== undefined) notice.targetBatch = targetBatch;
    if (req.file) notice.imageUrl = `/uploads/${req.file.filename}`;
    await notice.save();

    res.status(200).json(notice);
  } catch (err) {
    next(err);
  }
};

const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return next(new AppError('Notice not found.', 404));

    await Promise.all([
      Comment.deleteMany({ noticeId: notice._id }),
      NoticeRead.deleteMany({ noticeId: notice._id }),
      notice.deleteOne(),
    ]);

    res.status(200).json({ message: 'Notice deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return next(new AppError('Notice not found.', 404));

    await NoticeRead.updateOne(
      { noticeId: notice._id, userId: req.user.id },
      { $setOnInsert: { readAt: new Date() } },
      { upsert: true }
    );

    res.status(200).json({ message: 'Marked as read.' });
  } catch (err) {
    next(err);
  }
};

const getReadReceipts = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return next(new AppError('Notice not found.', 404));

    const reads = await NoticeRead.find({ noticeId: notice._id })
      .populate('userId', 'name email')
      .sort({ readAt: -1 });

    res.status(200).json({
      count: reads.length,
      readers: reads
        .filter((r) => r.userId)
        .map((r) => ({
          id: r.userId.id,
          name: r.userId.name,
          email: r.userId.email,
          readAt: r.readAt,
        })),
    });
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') {
      const fullUser = await User.findById(req.user.id).select('batch');
      const userBatch = fullUser?.batch || 'N/A';
      filter.targetBatch = { $in: ['All', userBatch] };
    }

    const relevantNotices = await Notice.find(filter).select('_id');
    const ids = relevantNotices.map((n) => n._id);
    if (ids.length === 0) return res.status(200).json({ unreadCount: 0 });

    const readCount = await NoticeRead.countDocuments({ userId: req.user.id, noticeId: { $in: ids } });
    res.status(200).json({ unreadCount: Math.max(ids.length - readCount, 0) });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  markAsRead,
  getReadReceipts,
  getUnreadCount,
};
