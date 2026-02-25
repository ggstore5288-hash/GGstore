const AuditLog = require('../models/AuditLog');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { getPagination, createPaginationMeta } = require('../utils/helpers');

/**
 * @desc    Get audit logs (Admin only)
 * @route   GET /api/audit-logs
 * @access  Private/Admin
 */
const getAuditLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, user, action, resource, startDate, endDate } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        // Build query
        const query = {};

        if (user) {
            query.user = user;
        }

        if (action) {
            query.action = action;
        }

        if (resource) {
            query.resource = resource;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        // Get audit logs
        const auditLogs = await AuditLog.find(query)
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await AuditLog.countDocuments(query);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                auditLogs,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get audit log by ID (Admin only)
 * @route   GET /api/audit-logs/:id
 * @access  Private/Admin
 */
const getAuditLogById = async (req, res, next) => {
    try {
        const auditLog = await AuditLog.findById(req.params.id)
            .populate('user', 'name email role');

        if (!auditLog) {
            return next(new AppError('Audit log not found', HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { auditLog }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAuditLogs,
    getAuditLogById
};
