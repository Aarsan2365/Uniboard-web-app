const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return next(new AppError('Not authorized, no token provided.', 401));
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('role batch');
    if (!user) return next(new AppError('Account not found. Please sign in again.', 401));
    req.user = { id: user.id, role: user.role, batch: user.batch };
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
      return next(new AppError('Your session expired. Please sign in again.', 401));
    }
    return next(error);
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission for this action.', 403));
  }
  next();
};
module.exports = { protect, restrictTo };
