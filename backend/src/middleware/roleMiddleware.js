const { AppError } = require('./errorMiddleware');
const { HTTP_STATUS, USER_ROLES } = require('../utils/constants');

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return next(
            new AppError('Not authorized to access this route', HTTP_STATUS.UNAUTHORIZED)
        );
    }

    if (req.user.role !== USER_ROLES.ADMIN) {
        return next(
            new AppError(
                'Access denied. Admin privileges required',
                HTTP_STATUS.FORBIDDEN
            )
        );
    }

    next();
};

/**
 * Check if user has specific role
 */
const hasRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(
                new AppError('Not authorized to access this route', HTTP_STATUS.UNAUTHORIZED)
            );
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `Access denied. Required role: ${roles.join(' or ')}`,
                    HTTP_STATUS.FORBIDDEN
                )
            );
        }

        next();
    };
};

module.exports = {
    requireAdmin,
    hasRole
};
