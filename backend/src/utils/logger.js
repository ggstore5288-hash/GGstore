/**
 * Lightweight native logger to replace 'winston'
 */
const isProduction = process.env.NODE_ENV === 'production';

const formatMessage = (level, message, meta) => {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
};

const log = {
    error: (message, meta = {}) => {
        console.error(formatMessage('error', message, meta));
    },
    warn: (message, meta = {}) => {
        console.warn(formatMessage('warn', message, meta));
    },
    info: (message, meta = {}) => {
        console.log(formatMessage('info', message, meta));
    },
    debug: (message, meta = {}) => {
        if (!isProduction) {
            console.debug(formatMessage('debug', message, meta));
        }
    },
    verbose: (message, meta = {}) => {
        if (!isProduction) {
            console.log(formatMessage('verbose', message, meta));
        }
    },
    
    // Request logging helper
    request: (req, res, responseTime) => {
        log.info('HTTP Request', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.user?._id || 'anonymous'
        });
    },
    
    // Error logging helper
    errorWithContext: (error, req = null) => {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            name: error.name
        };
        
        if (req) {
            errorInfo.request = {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
                userId: req.user?._id || 'anonymous'
            };
        }
        
        log.error('Error occurred', errorInfo);
    }
};

module.exports = log;

