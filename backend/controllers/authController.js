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
    const { name, email, password, batch } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return next(new AppError('An account with this email already exists.', 409));

    const hashedPassword = await bcrypt.hash(password, 10);
    const resolvedRole = 'student'; // Public registration must never grant admin access.
    const resolvedBatch = batch || 'N/A';

    const user = await User.create({ name, email, password: hashedPassword, role: resolvedRole, batch: resolvedBatch });
    res.status(201).json({ message: 'Student account created. Please sign in.', user: publicUser(user) });
  } catch (err) {
    if (err?.code === 11000) return next(new AppError('An account with this email already exists.', 409));
    next(err);
  }
};

// The route fixes the expected role. A submitted role can never choose a portal.
const loginForRole = expectedRole => async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Invalid email or password.', 401));
    }
    if (user.role !== expectedRole) {
      const message = expectedRole === 'student'
        ? 'This is an administrator account. Please use Admin Login.'
        : 'Admin Login is only for administrator accounts. Please use Student Login.';
      return next(new AppError(message, 403));
    }
    res.status(200).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};
const login = loginForRole('student');
const adminLogin = loginForRole('admin');

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

    const frontendUrl = process.env.FRONTEND_URL || process.env.URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}${user.role === 'admin' ? '?portal=admin' : ''}`;
    if (process.env.NODE_ENV !== 'production') console.log(`\n🔐 Development password reset link:\n${resetUrl}\n`);

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

const getMe = async (req, res, next) => {
  try { res.json({ user: publicUser(await User.findById(req.user.id)) }); }
  catch (error) { next(error); }
};
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.name = req.body.name;
    if (user.role === 'student') user.batch = req.body.batch;
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
};
module.exports = { register, login, adminLogin, forgotPassword, resetPassword, getMe, updateProfile };
