// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../middlewares/validators');
const { authLimiter } = require('../middlewares/rateLimiter');

// authLimiter guards against brute-forcing credentials or spamming
// account creation from a single IP.
router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);

module.exports = router;
