const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, updateNotificationSettings } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.patch('/notifications', protect, updateNotificationSettings);

module.exports = router;