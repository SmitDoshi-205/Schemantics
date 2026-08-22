const User = require('../models/User');
const generateToken = require('../utils/generateToken');

async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Email and password are both required.');
      err.status = 400;
      throw err;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const err = new Error('An account with that email already exists.');
      err.status = 409;
      throw err;
    }

    const user = await User.create({ email, password });

    res.status(201).json({
      id: user._id,
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
    email: req.user.email,
    createdAt: req.user.createdAt,
    notifyEmail: req.user.notifyEmail,
    webhookUrl: req.user.webhookUrl,
  });
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

module.exports = { register, login, getMe, updateNotificationSettings };