// middlewares/authMiddleware.js
//
// `protect`  — verifies the JWT sent in the Authorization header and
//              attaches the decoded user info (id, role) to req.user.
//              Any route that needs a logged-in user uses this first.
//
// `restrictTo(...roles)` — a small factory that returns a middleware
//              checking req.user.role against an allow-list. This is
//              the core of our role-based access control: e.g.
//              restrictTo('admin') on notice-creation routes means
//              students get a 403 even if they're logged in.

const jwt = require('jsonwebtoken');
require('dotenv').config();
const AppError = require('../utils/AppError');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not authorized, no token provided.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id, role, iat, exp } — see authController.js for what we sign
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Not authorized, token invalid or expired.', 401));
  }
};

const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}.`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };
