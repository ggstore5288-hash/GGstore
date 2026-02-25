const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Request logging middleware with request ID tracking
 */
const requestLogger = (req, res, next) => {
    // Generate unique request ID
    const requestId = uuidv4();
    req.requestId = requestId;
    
    // Add request ID to response header
    res.setHeader('X-Request-ID', requestId);
    
    // Record start time
    const startTime = Date.now();
    
    // Log request
    logger.info('Incoming Request', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?._id || 'anonymous'
    });
    
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const responseTime = Date.now() - startTime;
        
        // Log response
        logger.request(req, res, responseTime);
        
        // Call original end
        originalEnd.call(this, chunk, encoding);
    };
    
    next();
};

module.exports = requestLogger;
