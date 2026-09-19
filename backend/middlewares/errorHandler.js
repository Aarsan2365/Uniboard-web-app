// middlewares/errorHandler.js
//
// One place that turns any thrown error into a consistent JSON
// response, instead of every controller having its own ad-hoc
// try/catch shape. Mounted LAST in server.js (error middleware must
// be registered after all routes — Express identifies it by its
// 4-argument signature).

const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (!err.isOperational) {
    // Unexpected/programming error — log full detail server-side,
    // but don't leak stack traces or internals to the client.
    logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err);
  }

  res.status(statusCode).json({
    message: err.isOperational ? err.message : 'Something went wrong on our end.',
  });
};

module.exports = { notFound, errorHandler };
