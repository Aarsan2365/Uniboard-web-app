// middlewares/rateLimiter.js
//
// Rate limiting protects against brute-force login attempts and
// general API abuse. Two tiers: a tight one on auth endpoints
// (where brute-forcing passwords is the real risk) and a looser
// general one on everything else.

const rateLimit = require('express-rate-limit');
const { serverless } = require('../utils/storagePaths');
const MongoRateStore = require('../utils/mongoRateStore');
const functionOptions = prefix => serverless ? {
  store: new MongoRateStore(prefix),
  keyGenerator: req => req.netlifyClientIP || 'unknown',
  validate: { xForwardedForHeader: false }
} : {};

const authLimiter = rateLimit({
  ...functionOptions('auth'),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login/register attempts per window per IP
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  ...functionOptions('api'),
  windowMs: 15 * 60 * 1000,
  max: 300, // generous, just guards against runaway scripts/bots
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };
