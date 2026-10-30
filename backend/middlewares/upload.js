const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const AppError = require('../utils/AppError');
const uploadDir = path.join(__dirname, '..', 'uploads');
const pdfDir = path.join(__dirname, '..', 'documents');
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(pdfDir, { recursive: true });
const extensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf'
};
const storage = multer.diskStorage({
  destination: (_req, file, cb) => cb(null, file.fieldname === 'pdf' ? pdfDir : uploadDir),
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${extensions[file.mimetype]}`)
});
module.exports = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'pdf') {
      if (file.mimetype !== 'application/pdf' || path.extname(file.originalname).toLowerCase() !== '.pdf') {
        return cb(new AppError('Choose a PDF document with a .pdf filename.', 400));
      }
    } else if (!file.mimetype.startsWith('image/') || !extensions[file.mimetype]) {
      return cb(new AppError('Only JPEG, PNG, WebP and GIF images are allowed.', 400));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 2, fields: 10, parts: 12 }
});
