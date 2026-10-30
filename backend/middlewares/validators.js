const { body, query, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array().map(e => e.msg).join(' '),
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Enter a valid email.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must contain at least 8 characters.'),
  body('role').optional().equals('student').withMessage('Public registration is for students only.'),
  body('batch').isIn(['2021','2022','2023','2024','2025','2026']).withMessage('Please select a valid batch.'),
  handleValidation
];
const loginValidator = [
  body('email').isEmail().withMessage('Enter a valid email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation
];
const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Enter a valid email.').normalizeEmail(),
  handleValidation
];
const resetPasswordValidator = [
  body('password').isLength({ min: 8 }).withMessage('Password must contain at least 8 characters.'),
  handleValidation
];
const noticeValidator = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 150 }),
  body('body').trim().notEmpty().withMessage('Notice content is required.')
    .isLength({ max: 10000 }).withMessage('Notice content must be at most 10,000 characters.'),
  body('removeImage').optional().isBoolean().withMessage('Invalid image removal option.'),
  body('removePdf').optional().isBoolean().withMessage('Invalid PDF removal option.'),
  body('category').optional().isIn(['Exam Schedules','Sports','General','Events','Academic']).withMessage('Invalid category.'),
  body('targetBatch').optional().isIn(['All','2021','2022','2023','2024','2025','2026']).withMessage('Invalid batch.'),
  body('eventDate').if(body('category').equals('Events'))
    .notEmpty().withMessage('Event date is required.').bail()
    .isISO8601({ strict: true }).withMessage('Enter a valid event date.'),
  body('eventLocation').if(body('category').equals('Events'))
    .trim().notEmpty().withMessage('Event location is required.').isLength({ max: 160 }),
  handleValidation
];
const commentValidator = [
  body('body').trim().notEmpty().withMessage('Comment cannot be empty.')
    .isLength({ max: 500 }).withMessage('Comment must be under 500 characters.'),
  handleValidation
];
const paginationValidator = [
  query('sort').optional().isIn(['newest', 'oldest', 'title-asc', 'title-desc']).withMessage('Invalid sort option.'),
  query('category').optional().isIn(['Exam Schedules', 'Sports', 'General', 'Events', 'Academic']).withMessage('Invalid category filter.'),
  query('targetBatch').optional().isIn(['All', '2021', '2022', '2023', '2024', '2025', '2026']).withMessage('Invalid audience filter.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit.'),
  query('search').optional().isString().isLength({ max: 160 }).withMessage('Search is too long.'),
  handleValidation
];
module.exports = {
  handleValidation,
  registerValidator, loginValidator, forgotPasswordValidator,
  resetPasswordValidator, noticeValidator, commentValidator, paginationValidator
};
