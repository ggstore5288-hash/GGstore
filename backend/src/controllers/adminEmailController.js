const EmailQueue = require('../models/EmailQueue');
const { HTTP_STATUS } = require('../utils/constants');
const { getPagination, createPaginationMeta } = require('../utils/helpers');
const { processEmailQueue, retryFailedEmails } = require('../services/emailQueueService');

/**
 * @desc    Get email queue (Admin)
 * @route   GET /api/admin/emails
 * @access  Private/Admin
 */
const getEmailQueue = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, status } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const query = {};
        if (status) query.status = status;

        const emails = await EmailQueue.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await EmailQueue.countDocuments(query);

        // Get statistics
        const stats = await EmailQueue.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusStats = {};
        stats.forEach(stat => {
            statusStats[stat._id] = stat.count;
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                emails,
                stats: statusStats,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Retry failed emails (Admin)
 * @route   POST /api/admin/emails/retry
 * @access  Private/Admin
 */
const retryEmails = async (req, res, next) => {
    try {
        await retryFailedEmails();
        await processEmailQueue();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Email queue processing triggered'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete email from queue (Admin)
 * @route   DELETE /api/admin/emails/:id
 * @access  Private/Admin
 */
const deleteEmailFromQueue = async (req, res, next) => {
    try {
        const email = await EmailQueue.findById(req.params.id);
        if (!email) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                error: 'Email not found in queue'
            });
        }

        await email.deleteOne();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Email removed from queue'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEmailQueue,
    retryEmails,
    deleteEmailFromQueue
};
