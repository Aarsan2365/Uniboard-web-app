// utils/AppError.js
//
// A small custom Error subclass for "expected" errors we throw on
// purpose (bad input, not found, forbidden, etc.), as opposed to
// genuine bugs. `isOperational: true` lets the central error handler
// (middlewares/errorHandler.js) tell the two apart — operational
// errors get their message shown to the client; anything else gets
// a generic "Something went wrong" so we never leak internals.

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
