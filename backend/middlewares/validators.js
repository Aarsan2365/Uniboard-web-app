const { body, query, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').optional().isIn(['admin', 'student']).withMessage('Role must be admin or student.'),
  body('batch').optional().isIn(['2021', '2022', '2023', '2024', '2025', 'N/A']).withMessage('Invalid batch.'),
  handleValidation,
];

const loginValidator = [
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation,
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  handleValidation,
];

const resetPasswordValidator = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  handleValidation,
];

const noticeValidator = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 150 }),
  body('body').trim().notEmpty().withMessage('Body is required.'),
  body('category').optional().isIn(['Exam Schedules', 'Sports', 'General', 'Events', 'Academic']).withMessage('Invalid category.'),
  handleValidation,
];

const commentValidator = [
  body('body').trim().notEmpty().withMessage('Comment cannot be empty.').isLength({ max: 500 }).withMessage('Comment must be under 500 characters.'),
  handleValidation,
];

const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100.'),
  handleValidation,
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  noticeValidator,
  commentValidator,
  paginationValidator,
};
