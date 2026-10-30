const express = require('express');
const router = express.Router();
const { register, login, adminLogin, forgotPassword, resetPassword, getMe, updateProfile } = require('../controllers/authController');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../middlewares/validators');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/admin/login', authLimiter, loginValidator, adminLogin);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordValidator, resetPassword);

const { protect } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { handleValidation } = require('../middlewares/validators');
router.get('/me', protect, getMe);
router.put('/me', protect,
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('batch').if((_value, { req }) => req.user.role === 'student')
    .isIn(['2021','2022','2023','2024','2025','2026']).withMessage('Select your academic batch.'),
  handleValidation, updateProfile);
module.exports = router;
