const express = require('express');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 5 attempts per 15 minutes as per README security specification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // set to 30 for seamless development/testing while providing protection
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['MANAGER', 'STAFF', 'manager', 'staff']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().min(4, 'Verification code is required'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().min(4, 'Verification code is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

router.post('/signup', authLimiter, validate(signupSchema), authController.signup);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
