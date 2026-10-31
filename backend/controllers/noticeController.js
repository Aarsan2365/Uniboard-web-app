const mongoose = require('mongoose');
const { Notice, NoticeRead, Comment, SavedNotice } = require('../models');
const { audienceFilter } = require('../middlewares/noticeAccess');
const AppError = require('../utils/AppError');
const { removeUpload, getPdfPath, pdfName } = require('../utils/uploadFiles');
const attachmentStore = require('../utils/attachmentStore');
const sortOptions = {
  newest: { createdAt: -1, _id: -1 }, oldest: { createdAt: 1, _id: 1 },
  'title-asc': { title: 1, _id: 1 }, 'title-desc': { title: -1, _id: -1 }
};
const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const serialize = (notice, additions = {}) => {
  const obj = notice.toJSON();
  obj.author = obj.createdBy || null;
  obj.targetBatch = obj.targetBatch || 'All';
  obj.pdfUrl = obj.pdfUrl || null;
  obj.pdfName = obj.pdfName || '';
  delete obj.createdBy;
  return { ...obj, ...additions };
};

const savedIdsFor = async (userId, ids) => new Set(
  (await SavedNotice.find({ userId, noticeId: { $in: ids } }).select('noticeId'))
    .map(x => x.noticeId.toString())
);

const getNotices = async (req, res, next) => {
  try {
    const { category, search, targetBatch } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const filter = { ...audienceFilter(req.user) };
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: new RegExp(escapeRegex(search), 'i') },
      { body: new RegExp(escapeRegex(search), 'i') }
    ];
    if (targetBatch) {
      if (req.user.role === 'admin') filter.targetBatch = targetBatch;
      else if (['All', req.user.batch].includes(targetBatch)) filter.targetBatch = targetBatch;
    }
    const [total, rows] = await Promise.all([
      Notice.countDocuments(filter),
      Notice.find(filter).sort(sortOptions[req.query.sort] || sortOptions.newest).skip((page - 1) * limit)
        .limit(limit).populate('createdBy', 'name')
    ]);
    const ids = rows.map(n => n._id);
    const [reads, saved] = await Promise.all([
      NoticeRead.find({ userId: req.user.id, noticeId: { $in: ids } }).select('noticeId'),
      savedIdsFor(req.user.id, ids)
    ]);
    const readIds = new Set(reads.map(x => x.noticeId.toString()));
    const data = rows.map(n => serialize(n, {
      isRead: readIds.has(n.id), isSaved: saved.has(n.id)
    }));
    res.json({ data, meta: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch (error) { next(error); }
};

const getNoticeById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Notice not found.', 404));
    const notice = await Notice.findOne({ _id: req.params.id, ...audienceFilter(req.user) })
      .populate('createdBy', 'name');
    if (!notice) return next(new AppError('Notice not found.', 404));
    const [saved, read] = await Promise.all([
      SavedNotice.exists({ userId: req.user.id, noticeId: notice._id }),
      NoticeRead.exists({ userId: req.user.id, noticeId: notice._id })
    ]);
    res.json(serialize(notice, { isSaved: Boolean(saved), isRead: Boolean(read) }));
  } catch (error) { next(error); }
};

const createNotice = async (req, res, next) => {
  try {
    const { title, body, category = 'General', targetBatch = 'All', eventDate, eventLocation } = req.body;
    const notice = await Notice.create({
      title, body, category, targetBatch, createdBy: req.user.id,
      imageUrl: req.files?.image?.[0] ? `/uploads/${req.files.image[0].filename}` : null,
      pdfUrl: req.files?.pdf?.[0] ? `/documents/${req.files.pdf[0].filename}` : null,
      pdfName: req.files?.pdf?.[0] ? pdfName(req.files.pdf[0]) : '',
      eventDate: category === 'Events' ? new Date(eventDate) : null,
      eventLocation: category === 'Events' ? eventLocation : ''
    });
    req.uploadCommitted = true;
    await notice.populate('createdBy', 'name');
    res.status(201).json(serialize(notice, { isRead: false, isSaved: false }));
  } catch (error) { next(error); }
};

const updateNotice = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Notice not found.', 404));
    const notice = await Notice.findById(req.params.id);
    if (!notice) return next(new AppError('Notice not found.', 404));
    const previousImage = notice.imageUrl;
    const previousPdf = notice.pdfUrl;
    for (const key of ['title', 'body', 'category', 'targetBatch']) {
      if (req.body[key] !== undefined) notice[key] = req.body[key];
    }
    if (notice.category === 'Events') {
      if (req.body.eventDate !== undefined) notice.eventDate = new Date(req.body.eventDate);
      if (req.body.eventLocation !== undefined) notice.eventLocation = req.body.eventLocation;
      if (!notice.eventDate || Number.isNaN(notice.eventDate.getTime()) || !notice.eventLocation?.trim()) {
        return next(new AppError('Event date and location are required.', 400));
      }
    } else {
      notice.eventDate = null;
      notice.eventLocation = '';
    }
    if (req.body.removeImage === true || req.body.removeImage === 'true') notice.imageUrl = null;
    if (req.files?.image?.[0]) notice.imageUrl = `/uploads/${req.files.image[0].filename}`;
    if (req.body.removePdf === true || req.body.removePdf === 'true') {
      notice.pdfUrl = null;
      notice.pdfName = '';
    }
    if (req.files?.pdf?.[0]) {
      notice.pdfUrl = `/documents/${req.files.pdf[0].filename}`;
      notice.pdfName = pdfName(req.files.pdf[0]);
    }
    await notice.save();
    req.uploadCommitted = true;
    if (previousImage !== notice.imageUrl) await removeUpload(previousImage);
    if (previousPdf !== notice.pdfUrl) await removeUpload(previousPdf);
    await notice.populate('createdBy', 'name');
    res.json(serialize(notice));
  } catch (error) { next(error); }
};

const deleteNotice = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Notice not found.', 404));
    const notice = await Notice.findById(req.params.id);
    if (!notice) return next(new AppError('Notice not found.', 404));
    await Promise.all([
      Comment.deleteMany({ noticeId: notice._id }),
      NoticeRead.deleteMany({ noticeId: notice._id }),
      SavedNotice.deleteMany({ noticeId: notice._id })
    ]);
    await notice.deleteOne();
    await removeUpload(notice.imageUrl);
    await removeUpload(notice.pdfUrl);
    res.json({ message: 'Notice deleted successfully.' });
  } catch (error) { next(error); }
};

const getNoticePdf = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Notice not found.', 404));
    const notice = await Notice.findOne({ _id: req.params.id, ...audienceFilter(req.user) });
    if (!notice) return next(new AppError('Notice not found.', 404));
    const filePath = getPdfPath(notice.pdfUrl);
    if (!filePath) return next(new AppError('This notice has no PDF attachment.', 404));
    res.attachment(notice.pdfName || 'announcement.pdf');
    if (req.query.download !== '1') res.set('Content-Disposition', res.get('Content-Disposition').replace(/^attachment/, 'inline'));
    res.type('application/pdf');
    res.set({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
    if (await attachmentStore.send(notice.pdfUrl, req, res)) return;
    res.sendFile(filePath, error => {
      if (!error) return;
      if (!res.headersSent) {
        res.removeHeader('Content-Disposition');
        res.removeHeader('Content-Type');
      }
      next(error.code === 'ENOENT' ? new AppError('The PDF file is missing. Ask an administrator to upload it again.', 404) : error);
    });
  } catch (error) { next(error); }
};

const markAsRead = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Notice not found.', 404));
    const notice = await Notice.findOne({ _id: req.params.id, ...audienceFilter(req.user) });
    if (!notice) return next(new AppError('Notice not found.', 404));
    await NoticeRead.updateOne(
      { userId: req.user.id, noticeId: notice._id },
      { $setOnInsert: { readAt: new Date() } }, { upsert: true }
    );
    res.json({ message: 'Marked as read.' });
  } catch (error) { next(error); }
};

const getReadReceipts = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Notice not found.', 404));
    const notice = await Notice.findById(req.params.id);
    if (!notice) return next(new AppError('Notice not found.', 404));
    const reads = await NoticeRead.find({ noticeId: notice._id })
      .populate('userId', 'name email').sort({ readAt: -1 });
    res.json({ count: reads.length, readers: reads.filter(x => x.userId).map(x => ({
      id: x.userId.id, name: x.userId.name, email: x.userId.email, readAt: x.readAt
    })) });
  } catch (error) { next(error); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const filter = audienceFilter(req.user);
    const ids = await Notice.distinct('_id', filter);
    const [total, readCount] = await Promise.all([
      Notice.countDocuments(filter),
      NoticeRead.countDocuments({ userId: req.user.id, noticeId: { $in: ids } })
    ]);
    res.json({ unreadCount: Math.max(0, total - readCount) });
  } catch (error) { next(error); }
};

const getUpcomingEvents = async (req, res, next) => {
  try {
    const filter = {
      ...audienceFilter(req.user), category: 'Events',
      eventDate: { $gte: new Date() }
    };
    const [total, events] = await Promise.all([
      Notice.countDocuments(filter),
      Notice.find(filter).sort({ eventDate: 1 }).limit(100)
        .populate('createdBy', 'name')
    ]);
    const [saved, reads] = await Promise.all([
      savedIdsFor(req.user.id, events.map(n => n._id)),
      NoticeRead.find({ userId: req.user.id, noticeId: { $in: events.map(n => n._id) } }).select('noticeId')
    ]);
    const readIds = new Set(reads.map(r => r.noticeId.toString()));
    res.json({ data: events.map(n => serialize(n, { isSaved: saved.has(n.id), isRead: readIds.has(n.id) })), meta: { total } });
  } catch (error) { next(error); }
};

module.exports = {
  getNotices, getNoticeById, getNoticePdf, createNotice, updateNotice, deleteNotice,
  markAsRead, getReadReceipts, getUnreadCount, getUpcomingEvents
};
