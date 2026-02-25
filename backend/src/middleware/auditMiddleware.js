const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');
const axios = require('axios');

/**
 * Audit middleware to log admin actions
 * Should be used after protect and requireAdmin middleware
 */
const auditLog = async (req, res, next) => {
    // Only log admin actions
    if (!req.user || req.user.role !== 'admin') {
        return next();
    }

    // Store original json method
    const originalJson = res.json;

    // Override res.json to capture response
    res.json = function (data) {
        // Log the action
        logAdminAction(req, res, data)
            .catch(err => {
                // Don't block response if logging fails
                logger.error('Failed to log admin action', { error: err.message });
            });

        // Call original json method
        return originalJson.call(this, data);
    };

    next();
};

/**
 * Log admin action to audit log
 */
const logAdminAction = async (req, res, responseData) => {
    try {
        const action = getActionFromRoute(req);
        const resource = getResourceFromRoute(req);
        const resourceId = req.params.id || req.params.productId || req.params.orderId ||
            req.params.userId || req.params.categoryId || req.params.promoCodeId || null;

        const auditData = {
            user: req.user._id,
            action,
            resource,
            resourceId,
            method: req.method,
            endpoint: req.originalUrl,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            changes: req.method !== 'GET' ? getChanges(req, responseData) : null,
            status: res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure',
            errorMessage: responseData?.error || null,
            location: await getLocationData(req.ip)
        };

        await AuditLog.create(auditData);
    } catch (error) {
        logger.error('Error creating audit log', { error: error.message });
    }
};

/**
 * Fetch location data from IP
 */
const getLocationData = async (ip) => {
    try {
        // Skip for localhost
        if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return {
                city: 'Localhost',
                country: 'Internal Network',
                countryCode: 'LH'
            };
        }

        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,lat,lon,timezone,isp`);

        if (response.data && response.data.status === 'success') {
            return {
                city: response.data.city,
                country: response.data.country,
                countryCode: response.data.countryCode,
                lat: response.data.lat,
                lon: response.data.lon,
                timezone: response.data.timezone,
                isp: response.data.isp
            };
        }
        return null;
    } catch (error) {
        return null;
    }
};

/**
 * Determine action from route
 */
const getActionFromRoute = (req) => {
    const method = req.method;
    const path = req.path.toLowerCase();

    if (method === 'GET') {
        if (path.includes('all') || path.endsWith('/')) {
            return 'list';
        }
        return 'view';
    } else if (method === 'POST') {
        return 'create';
    } else if (method === 'PUT' || method === 'PATCH') {
        return 'update';
    } else if (method === 'DELETE') {
        return 'delete';
    }

    return 'unknown';
};

/**
 * Determine resource from route
 */
const getResourceFromRoute = (req) => {
    const path = req.path.toLowerCase();

    if (path.includes('product')) return 'product';
    if (path.includes('order')) return 'order';
    if (path.includes('user')) return 'user';
    if (path.includes('category')) return 'category';
    if (path.includes('promo')) return 'promo_code';
    if (path.includes('payment')) return 'payment';
    if (path.includes('banner')) return 'banner';
    if (path.includes('featured')) return 'featured_product';
    if (path.includes('settings')) return 'settings';
    if (path.includes('loyalty')) return 'loyalty';
    if (path.includes('review')) return 'review';
    if (path.includes('flash-sale')) return 'flash_sale';
    if (path.includes('price-alert')) return 'price_alert';
    if (path.includes('email')) return 'email';
    if (path.includes('bulk')) return 'bulk_operation';
    if (path.includes('upload')) return 'upload';

    return 'unknown';
};

/**
 * Extract changes from request and response
 */
const getChanges = (req, responseData) => {
    try {
        // For updates, show what changed
        if (req.method === 'PUT' || req.method === 'PATCH') {
            return {
                updatedFields: Object.keys(req.body || {}),
                body: sanitizeSensitiveData(req.body)
            };
        }

        // For creates, show what was created
        if (req.method === 'POST') {
            return {
                created: sanitizeSensitiveData(req.body)
            };
        }

        return null;
    } catch (error) {
        return null;
    }
};

/**
 * Remove sensitive data from audit logs
 */
const sanitizeSensitiveData = (data) => {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }

    return sanitized;
};

module.exports = auditLog;
