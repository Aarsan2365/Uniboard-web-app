const crypto = require('crypto');
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

    const user = await User.create({ name, email, password: hashedPassword, role: resolvedRole, batch: resolvedBatch });
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

const forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email });

    const genericMessage = 'If an account exists with this email, a password reset link has been created.';
    if (!user) return res.status(200).json({ message: genericMessage });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    console.log(`\n🔐 Development password reset link:\n${resetUrl}\n`);

    const payload = { message: genericMessage };
    if (process.env.NODE_ENV !== 'production') payload.resetUrl = resetUrl;
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) return next(new AppError('Password reset link is invalid or has expired.', 400));

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
