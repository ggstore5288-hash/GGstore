const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    refreshToken,
    logout,
    getSessions,
    revokeSession,
    revokeAllOtherSessions,
    getCsrfToken
} = require('../controllers/authController');
const validate = require('../middleware/validateMiddleware');
const {
    signupValidator,
    loginValidator,
    verifyEmailValidator
} = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { protect } = require('../middleware/authMiddleware');
const auditLog = require('../middleware/auditMiddleware');

// Apply rate limiting to auth routes
router.use(authLimiter);

// @route   GET /api/auth/csrf-token
router.get('/csrf-token', getCsrfToken);

// @route   POST /api/auth/signup
router.post('/signup', signupValidator, validate, signup);

// @route   POST /api/auth/login
router.post('/login', loginValidator, validate, login);

// @route   POST /api/auth/verify-email
router.post('/verify-email', verifyEmailValidator, validate, verifyEmail);

// @route   POST /api/auth/resend-verification
router.post('/resend-verification', resendVerificationCode);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/verify-reset-code
router.post('/verify-reset-code', verifyResetCode);

// @route   POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// @route   POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// @route   POST /api/auth/logout
router.post('/logout', protect, logout);

// @route   GET /api/auth/sessions
router.get('/sessions', protect, getSessions);

// @route   DELETE /api/auth/sessions/:sessionId
router.delete('/sessions/:sessionId', protect, auditLog, revokeSession);

// @route   DELETE /api/auth/sessions
router.delete('/sessions', protect, auditLog, revokeAllOtherSessions);

module.exports = router;
