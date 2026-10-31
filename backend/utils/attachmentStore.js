const mongoose = require('mongoose');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');
const AppError = require('./AppError');
const { uploadDirectory, documentDirectory } = require('./storagePaths');

const enabled = () => process.env.UPLOAD_STORAGE === 'mongodb';
const bucket = () => {
  if (mongoose.connection.readyState !== 1) throw new AppError('Attachment storage is temporarily unavailable.', 503);
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'noticeFiles' });
};
const location = value => {
  const match = /^\/(uploads|documents)\/([^/\\]+)$/.exec(value || '');
  if (!match || !/\.(jpg|jpeg|png|webp|gif|pdf)$/i.test(match[2])) return null;
  const kind = match[1] === 'documents' ? 'pdf' : 'image';
  if ((kind === 'pdf') !== /\.pdf$/i.test(match[2])) return null;
  return { filename: match[2], kind, localPath: path.join(kind === 'pdf' ? documentDirectory : uploadDirectory, match[2]) };
};
const find = async value => {
  const item = location(value);
  if (!item) return null;
  return bucket().find({ filename: item.filename, 'metadata.kind': item.kind }).next();
};
const store = async file => {
  const upload = bucket().openUploadStream(file.filename, { metadata: { kind: file.fieldname === 'pdf' ? 'pdf' : 'image', contentType: file.mimetype } });
  try { await pipeline(fs.createReadStream(file.path), upload); }
  catch (error) { await upload.abort().catch(() => {}); throw error; }
};
const persistAttachments = async (req, _res, next) => {
  if (!enabled()) return next();
  try {
    for (const file of Object.values(req.files || {}).flat()) {
      await store(file);
      await fsp.unlink(file.path);
    }
    next();
  } catch (error) { next(new AppError('Unable to save the attachment to MongoDB. Check the database connection and storage quota.', 503)); }
};
const remove = async value => {
  const item = location(value);
  if (!item) return;
  const storage = bucket();
  for await (const file of storage.find({ filename: item.filename, 'metadata.kind': item.kind })) await storage.delete(file._id);
};
const send = async (value, req, res) => {
  if (!enabled()) return false;
  const file = await find(value);
  if (!file) return false;
  let start = 0, end = file.length;
  res.set({ 'Content-Type': file.metadata.contentType, 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes' });
  if (req.headers.range) {
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!range || (!range[1] && !range[2])) {
      res.status(416).set('Content-Range', `bytes */${file.length}`).end(); return true;
    }
    if (!range[1]) start = Math.max(0, file.length - Number(range[2]));
    else { start = Number(range[1]); if (range[2]) end = Math.min(file.length, Number(range[2]) + 1); }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= end || start >= file.length) {
      res.status(416).set('Content-Range', `bytes */${file.length}`).end(); return true;
    }
    res.status(206).set('Content-Range', `bytes ${start}-${end - 1}/${file.length}`);
  }
  res.set('Content-Length', String(end - start));
  if (req.method === 'HEAD') { res.end(); return true; }
  try { await pipeline(bucket().openDownloadStream(file._id, { start, end }), res); }
  catch (error) { if (!res.destroyed) throw error; }
  return true;
};
const serveImage = async (req, res, next) => {
  if (!enabled()) return next();
  try {
    const value = `/uploads/${req.params.filename}`;
    if (location(value)?.kind !== 'image' || !await send(value, req, res)) return next();
  } catch (error) { next(error); }
};
module.exports = { enabled, location, find, store, persistAttachments, remove, send, serveImage };
