const crypto = require('crypto');
const { AppError } = require('./errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');

// Store CSRF tokens in memory (in production, use Redis or database)
const csrfTokens = new Map();

/**
 * Generate CSRF token
 */
const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Create and store CSRF token
 */
const createCSRFToken = (req, res, next) => {
    const token = generateCSRFToken();

    // Store token with expiration (15 minutes)
    csrfTokens.set(token, {
        expires: Date.now() + 15 * 60 * 1000,
        ip: req.ip
    });

    // Set token in response header
    res.setHeader('X-CSRF-Token', token);

    // Also set in cookie for easier access
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('csrf-token', token, {
        httpOnly: false, // Must be accessible to JavaScript
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain production
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    next();
};

/**
 * Verify CSRF token
 */
const verifyCSRFToken = (req, res, next) => {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Get token from header or body
    const token = req.headers['x-csrf-token'] || req.body._csrf || req.query._csrf;

    if (!token) {
        return next(
            new AppError('CSRF token is required', HTTP_STATUS.FORBIDDEN)
        );
    }

    // Check if token exists and is valid
    const tokenData = csrfTokens.get(token);

    if (!tokenData) {
        return next(
            new AppError('Invalid CSRF token', HTTP_STATUS.FORBIDDEN)
        );
    }

    // Check expiration
    if (tokenData.expires < Date.now()) {
        csrfTokens.delete(token);
        return next(
            new AppError('CSRF token has expired', HTTP_STATUS.FORBIDDEN)
        );
    }

    // Optional: Verify IP address matches
    // Note: Disabled in production to prevent mismatch errors behind proxies
    if (process.env.NODE_ENV !== 'production' && tokenData.ip !== req.ip) {
        return next(
            new AppError('CSRF token IP mismatch', HTTP_STATUS.FORBIDDEN)
        );
    }

    // Token is valid, delete it (one-time use)
    // csrfTokens.delete(token); // Allow token reuse for better UX

    next();
};

/**
 * Clean up expired tokens (run periodically)
 */
const cleanupExpiredTokens = () => {
    const now = Date.now();
    for (const [token, data] of csrfTokens.entries()) {
        if (data.expires < now) {
            csrfTokens.delete(token);
        }
    }
};

// Clean up expired tokens every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

module.exports = {
    createCSRFToken,
    verifyCSRFToken
};
