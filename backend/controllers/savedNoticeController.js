const mongoose = require('mongoose');
const { Notice, SavedNotice, NoticeRead } = require('../models');
const { audienceFilter } = require('../middlewares/noticeAccess');
const AppError = require('../utils/AppError');

const getSavedNotices = async (req, res, next) => {
  try {
    const entries = await SavedNotice.find({ userId: req.user.id })
      .sort({ createdAt: -1 }).select('noticeId');
    const visible = await Notice.find({
      _id: { $in: entries.map(e => e.noticeId) }, ...audienceFilter(req.user)
    }).populate('createdBy', 'name');
    const reads = await NoticeRead.find({ userId: req.user.id, noticeId: { $in: visible.map(n => n._id) } }).select('noticeId');
    const readIds = new Set(reads.map(r => r.noticeId.toString()));
    const byId = new Map(visible.map(n => [n.id, n]));
    const data = entries.flatMap(entry => {
      const notice = byId.get(entry.noticeId.toString());
      if (!notice) return [];
      const obj = notice.toJSON();
      obj.author = obj.createdBy;
      delete obj.createdBy;
      obj.isSaved = true;
      obj.isRead = readIds.has(notice.id);
      return [obj];
    });
    res.json({ data });
  } catch (error) { next(error); }
};

const saveNotice = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Notice not found.', 404));
    const notice = await Notice.findOne({ _id: req.params.id, ...audienceFilter(req.user) });
    if (!notice) return next(new AppError('Notice not found.', 404));
    await SavedNotice.updateOne(
      { userId: req.user.id, noticeId: notice._id },
      { $setOnInsert: { userId: req.user.id, noticeId: notice._id } },
      { upsert: true }
    );
    res.json({ isSaved: true });
  } catch (error) { next(error); }
};

const unsaveNotice = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Notice not found.', 404));
    await SavedNotice.deleteOne({ userId: req.user.id, noticeId: req.params.id });
    res.json({ isSaved: false });
  } catch (error) { next(error); }
};
module.exports = { getSavedNotices, saveNotice, unsaveNotice };
