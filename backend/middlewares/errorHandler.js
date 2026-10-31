const multer = require('multer');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { maxAttachmentMB } = require('../utils/storagePaths');
const notFound = (req, res, next) =>
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
const errorHandler = (error, req, res, _next) => {
  if (res.headersSent) return _next(error);
  if (error instanceof multer.MulterError) {
    return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ message: error.code === 'LIMIT_FILE_SIZE' ? `Each attachment must not exceed ${maxAttachmentMB} MB.` : error.code === 'LIMIT_UNEXPECTED_FILE' || error.code === 'LIMIT_FILE_COUNT' ? 'Upload at most one image and one PDF.' : error.message });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.name === 'ValidationError' ? Object.values(error.errors).map(e => e.message).join(' ') : 'Invalid request data.' });
  }
  if (error.message?.startsWith('Only JPEG')) {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'This record already exists.' });
  }
  if (!error.isOperational) logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, error);
  res.status(error.statusCode || 500).json({ message: error.isOperational ? error.message : 'Something went wrong on our end.' });
};
module.exports = { notFound, errorHandler };
