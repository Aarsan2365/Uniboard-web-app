const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const AppError = require('../utils/AppError');

const signToken = (user) => jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
);

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  batch: user.batch,
});

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, batch } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new AppError('An account with this email already exists.', 409));

    const hashedPassword = await bcrypt.hash(password, 10);
    const resolvedRole = role === 'admin' ? 'admin' : 'student';
    const resolvedBatch = resolvedRole === 'admin' ? 'N/A' : (batch || 'N/A');

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: resolvedRole,
      batch: resolvedBatch,
    });

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    if (err?.code === 11000) return next(new AppError('An account with this email already exists.', 409));
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    res.status(200).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
