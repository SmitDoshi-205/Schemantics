const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const {sendEmailAlert} = require('../services/notificationService');
const crypto = require('crypto');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const err = new Error('Name, email, and password are all required.');
      err.status = 400;
      throw err;
    }

    if (typeof name !== 'string' || !name.trim()) {
      const err = new Error('Name must be a non-empty string.');
      err.status = 400;
      throw err;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const err = new Error('An account with that email already exists.');
      err.status = 409;
      throw err;
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      id: user._id,
      name : user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Email and password are both required.');
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      const err = new Error('Invalid email or password.');
      err.status = 401;
      throw err;
    }

    res.status(200).json({
      id: user._id,
      name : user.name || user.email.split('@')[0], 
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res) {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name || req.user.email.split('@')[0],
    email: req.user.email,
    createdAt: req.user.createdAt,
    notifyEmail: req.user.notifyEmail,
    webhookUrl: req.user.webhookUrl,
  });
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      const err = new Error('Email is required.');
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond the same way whether or not the email exists -
    // don't leak which emails are registered.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
      await sendEmailAlert({
        to: user.email,
        endpointName: 'Password Reset',
        status: 'requested',
        diff: [{ path: 'reset_link', changeType: 'added', oldType: null, newType: resetUrl, severity: 'info' }],
      }).catch(() => {}); // never let email failure block the response
    }

    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      const err = new Error('Token and new password are required.');
      err.status = 400;
      throw err;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      const err = new Error('Reset link is invalid or has expired.');
      err.status = 400;
      throw err;
    }

    user.password = password; // pre-save hook rehashes it
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    next(err);
  }
}

async function updateNotificationSettings(req, res, next) {
  try {
    const { notifyEmail, webhookUrl } = req.body;

    if (notifyEmail !== undefined && typeof notifyEmail !== 'boolean') {
      const err = new Error('notifyEmail must be a boolean.');
      err.status = 400;
      throw err;
    }

    if (webhookUrl !== undefined && webhookUrl !== null) {
      if (typeof webhookUrl !== 'string') {
        const err = new Error('webhookUrl must be a string or null.');
        err.status = 400;
        throw err;
      }
      try {
        const parsed = new URL(webhookUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          throw new Error('bad protocol');
        }
      } catch (e) {
        const err = new Error('webhookUrl is not a valid http(s) URL.');
        err.status = 400;
        throw err;
      }
    }

    if (notifyEmail !== undefined) req.user.notifyEmail = notifyEmail;
    if (webhookUrl !== undefined) req.user.webhookUrl = webhookUrl;

    await req.user.save();

    res.status(200).json({
      notifyEmail: req.user.notifyEmail,
      webhookUrl: req.user.webhookUrl,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe,forgotPassword, resetPassword, updateNotificationSettings };