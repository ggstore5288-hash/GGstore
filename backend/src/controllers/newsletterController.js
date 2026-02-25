const Newsletter = require('../models/Newsletter');
const EmailQueue = require('../models/EmailQueue');
const { HTTP_STATUS } = require('../utils/constants');
const { getPagination, createPaginationMeta } = require('../utils/helpers');

/**
 * @desc    Subscribe to newsletter
 * @route   POST /api/newsletter/subscribe
 * @access  Public
 */
const subscribe = async (req, res, next) => {
    try {
        const { email } = req.body;

        const existingSubscriber = await Newsletter.findOne({ email });
        if (existingSubscriber) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Already subscribed'
            });
        }

        await Newsletter.create({ email });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Successfully subscribed to newsletter'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Already subscribed'
            });
        }
        next(error);
    }
};

/**
 * @desc    Get all subscribers (Admin)
 * @route   GET /api/admin/newsletter/subscribers
 * @access  Private/Admin
 */
const getSubscribers = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const subscribers = await Newsletter.find()
            .sort({ subscribedAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Newsletter.countDocuments();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                subscribers,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete subscriber (Admin)
 * @route   DELETE /api/admin/newsletter/subscribers/:id
 * @access  Private/Admin
 */
const deleteSubscriber = async (req, res, next) => {
    try {
        const subscriber = await Newsletter.findById(req.params.id);
        if (!subscriber) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                error: 'Subscriber not found'
            });
        }

        await subscriber.deleteOne();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Subscriber removed'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Send bulk email (Admin)
 * @route   POST /api/admin/newsletter/send
 * @access  Private/Admin
 */
const sendBulkEmail = async (req, res, next) => {
    try {
        const { subject, template, imageUrl } = req.body;

        if (!subject || !template) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: 'Subject and template are required'
            });
        }

        const subscribers = await Newsletter.find({ isActive: true });

        if (subscribers.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: 'No active subscribers found'
            });
        }

        // Create email content with image if provided
        let htmlContent = template;
        if (imageUrl) {
            htmlContent = `<div style="text-align: center; margin-bottom: 20px;"><img src="${imageUrl}" alt="Newsletter Image" style="max-width: 100%; height: auto;"></div>` + htmlContent;
        }

        // Add to email queue
        const emailPromises = subscribers.map(subscriber => {
            return EmailQueue.create({
                to: subscriber.email,
                subject,
                html: htmlContent,
                emailType: 'other'
            });
        });

        await Promise.all(emailPromises);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Newsletter queued for ${subscribers.length} subscribers`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    subscribe,
    getSubscribers,
    deleteSubscriber,
    sendBulkEmail
};
