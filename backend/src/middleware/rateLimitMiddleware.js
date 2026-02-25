const rateLimit = require('express-rate-limit');

// In-memory store for user-based rate limiting (in production, use Redis)
const userRateLimitStore = new Map();

/**
 * Clean up expired user rate limit entries
 */
const cleanupUserRateLimits = () => {
    const now = Date.now();
    for (const [key, data] of userRateLimitStore.entries()) {
        if (data.expires < now) {
            userRateLimitStore.delete(key);
        }
    }
};

// Clean up every 5 minutes
setInterval(cleanupUserRateLimits, 5 * 60 * 1000);

/**
 * User-based rate limiter middleware
 */
const userRateLimiter = (windowMs, maxRequests, message) => {
    return async (req, res, next) => {
        // Only apply to authenticated users
        if (!req.user || !req.user._id) {
            return next();
        }

        const userId = req.user._id.toString();
        const key = `user:${userId}`;
        const now = Date.now();

        // Get or create rate limit data
        let rateLimitData = userRateLimitStore.get(key);

        if (!rateLimitData || rateLimitData.expires < now) {
            // Create new rate limit entry
            rateLimitData = {
                count: 0,
                expires: now + windowMs,
                resetTime: now + windowMs
            };
            userRateLimitStore.set(key, rateLimitData);
        }

        // Increment count
        rateLimitData.count++;

        // Check if limit exceeded
        if (rateLimitData.count > maxRequests) {
            const retryAfter = Math.ceil((rateLimitData.expires - now) / 1000);
            res.setHeader('Retry-After', retryAfter);
            return res.status(429).json({
                success: false,
                error: message || 'Too many requests. Please slow down and try again later.',
                retryAfter
            });
        }

        next();
    };
};

/**
 * General API rate limiter (IP-based)
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP. Please wait 15 minutes before trying again.',
        error: 'Too many requests from this IP. Please wait 15 minutes before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * User-based API rate limiter (for authenticated users)
 */
const userApiLimiter = userRateLimiter(
    15 * 60 * 1000, // 15 minutes
    200, // 200 requests per 15 minutes for authenticated users
    'Too many requests. Please slow down and try again later.'
);

/**
 * Auth routes rate limiter (stricter, IP-based)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts. Please wait 15 minutes and try again.',
        error: 'Too many authentication attempts. Please wait 15 minutes and try again.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

/**
 * File upload rate limiter (IP-based)
 */
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 uploads per hour
    message: {
        success: false,
        message: 'Too many file uploads. Please wait a while before trying again.',
        error: 'Too many file uploads. Please wait a while before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * User-based file upload rate limiter
 */
const userUploadLimiter = userRateLimiter(
    60 * 60 * 1000, // 1 hour
    50, // 50 uploads per hour for authenticated users
    'Too many file uploads. Please wait a while before trying again.'
);

/**
 * Admin rate limiter (more permissive)
 */
const adminLimiter = userRateLimiter(
    15 * 60 * 1000, // 15 minutes
    500, // 500 requests per 15 minutes for admins
    'Too many requests. Please slow down and try again later.'
);

module.exports = {
    apiLimiter,
    userApiLimiter,
    authLimiter,
    uploadLimiter,
    userUploadLimiter,
    adminLimiter
};
