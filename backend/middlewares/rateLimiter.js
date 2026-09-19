// middlewares/rateLimiter.js
//
// Rate limiting protects against brute-force login attempts and
// general API abuse. Two tiers: a tight one on auth endpoints
// (where brute-forcing passwords is the real risk) and a looser
// general one on everything else.

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login/register attempts per window per IP
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // generous, just guards against runaway scripts/bots
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };
