const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Custom Error Class
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Handle 404 - Not Found
 */
const notFound = (req, res, next) => {
    const error = new AppError(
        `Route not found - ${req.originalUrl}`,
        HTTP_STATUS.NOT_FOUND
    );
    next(error);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

    // Log error with context
    logger.errorWithContext(err, req);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, HTTP_STATUS.NOT_FOUND);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = new AppError(message, HTTP_STATUS.CONFLICT);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
        error = new AppError(message, HTTP_STATUS.BAD_REQUEST);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please login again';
        error = new AppError(message, HTTP_STATUS.UNAUTHORIZED);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired. Please login again';
        error = new AppError(message, HTTP_STATUS.UNAUTHORIZED);
    }

    // Ensure CORS headers are present even on errors
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Send error response
    res.status(error.statusCode).json({
        success: false,
        message: error.isOperational ? error.message : 'Something went wrong. Please try again later.',
        error: error.isOperational ? error.message : 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            originalError: err.message
        })
    });
};

module.exports = {
    AppError,
    notFound,
    errorHandler
};
