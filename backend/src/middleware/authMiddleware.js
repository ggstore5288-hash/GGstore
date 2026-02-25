const User = require('../models/User');
const { AppError } = require('./errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { verifyAccessToken } = require('../services/tokenService');

/**
 * Protect routes - Verify JWT access token
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return next(
                new AppError('Not authorized to access this route', HTTP_STATUS.UNAUTHORIZED)
            );
        }

        try {
            // Verify access token
            const decoded = verifyAccessToken(token);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password -refreshToken -refreshTokenExpires');

            if (!req.user) {
                return next(
                    new AppError('User not found', HTTP_STATUS.UNAUTHORIZED)
                );
            }

            next();
        } catch (error) {
            return next(
                new AppError('Not authorized to access this route', HTTP_STATUS.UNAUTHORIZED)
            );
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Require email verification
 */
const requireEmailVerification = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return next(
            new AppError(
                'Please verify your email address to access this resource',
                HTTP_STATUS.FORBIDDEN
            )
        );
    }
    next();
};

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(
            new AppError(
                'Access denied. Admin privileges required',
                HTTP_STATUS.FORBIDDEN
            )
        );
    }
    next();
};

module.exports = {
    protect,
    requireEmailVerification,
    requireAdmin
};
