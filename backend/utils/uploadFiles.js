const fs = require('node:fs/promises');
const path = require('node:path');
const logger = require('./logger');
const AppError = require('./AppError');
const uploadDirectory = path.join(__dirname, '../uploads');
const documentDirectory = path.join(__dirname, '../documents');

// PDF bytes are outside the public images directory. Only the audience-checked
// notice endpoint may serve them; database paths cannot select arbitrary files.
const getPdfPath = value => /^\/documents\/[0-9a-f-]{36}\.pdf$/i.test(value || '')
  ? path.join(documentDirectory, value.slice('/documents/'.length)) : null;
const pdfName = file => {
  const name = String(file.originalname || 'announcement.pdf').split(/[\\/]/).pop()
    .replace(/[\u0000-\u001f\u007f]/g, '').replace(/\.pdf$/i, '').trim();
  return `${(name || 'announcement').slice(0, 156)}.pdf`;
};

// Only remove a single local upload, never an external URL or a nested path.
const removeUpload = async value => {
  let filePath = getPdfPath(value);
  if (!filePath && /^\/uploads\/[^/\\]+$/.test(value || '')) {
    const filename = value.slice('/uploads/'.length);
    if (filename === '.' || filename === '..' || filename === '.gitkeep') return;
    filePath = path.join(uploadDirectory, filename);
  }
  if (!filePath) return;
  try { await fs.unlink(filePath); }
  catch (error) { if (error.code !== 'ENOENT') logger.error('Could not remove an unused notice attachment', error); }
};
const cleanupRejectedUpload = (req, res, next) => {
  res.once('finish', () => {
    if (res.statusCode < 400 || req.uploadCommitted) return;
    const files = Object.values(req.files || {}).flat();
    for (const file of files) removeUpload(`/${file.fieldname === 'pdf' ? 'documents' : 'uploads'}/${file.filename}`);
  });
  next();
};

const validatePdfUpload = async (req, _res, next) => {
  const file = req.files?.pdf?.[0];
  if (!file) return next();
  try {
    const handle = await fs.open(file.path, 'r');
    try {
      const header = Buffer.alloc(8);
      await handle.read(header, 0, header.length, 0);
      const tail = Buffer.alloc(Math.min(file.size, 1024));
      await handle.read(tail, 0, tail.length, Math.max(0, file.size - tail.length));
      if (!/^%PDF-(1\.[0-7]|2\.0)$/.test(header.toString('ascii')) || !tail.includes(Buffer.from('%%EOF'))) {
        throw new AppError('Choose a valid PDF file. Its PDF header or end marker is missing.', 400);
      }
    } finally {
      // Close before sending a rejection so cleanup also works on Windows.
      await handle.close();
    }
    next();
  } catch (error) { next(error); }
};
module.exports = { removeUpload, cleanupRejectedUpload, validatePdfUpload, getPdfPath, pdfName };
