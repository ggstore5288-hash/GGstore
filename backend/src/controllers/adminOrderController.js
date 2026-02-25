const Order = require('../models/Order');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS, ORDER_STATUS } = require('../utils/constants');
const { getPagination, createPaginationMeta } = require('../utils/helpers');

/**
 * @desc    Get order statistics (Admin)
 * @route   GET /api/admin/orders/stats
 * @access  Private/Admin
 */
const getOrderStats = async (req, res, next) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const stats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total' },
                    confirmedRevenue: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'confirmed'] }, '$total', 0]
                        }
                    },
                    byStatus: {
                        $push: '$orderStatus'
                    },
                    byPaymentStatus: {
                        $push: '$paymentStatus'
                    }
                }
            }
        ]);

        // Calculate status distribution
        const statusDistribution = {};
        const paymentStatusDistribution = {};

        if (stats.length > 0) {
            stats[0].byStatus.forEach(status => {
                statusDistribution[status] = (statusDistribution[status] || 0) + 1;
            });

            stats[0].byPaymentStatus.forEach(status => {
                paymentStatusDistribution[status] = (paymentStatusDistribution[status] || 0) + 1;
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                period: days,
                overview: {
                    totalOrders: stats[0]?.totalOrders || 0,
                    totalRevenue: stats[0]?.totalRevenue || 0,
                    confirmedRevenue: stats[0]?.confirmedRevenue || 0
                },
                statusDistribution,
                paymentStatusDistribution
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update order estimated delivery (Admin)
 * @route   PATCH /api/admin/orders/:id/delivery
 * @access  Private/Admin
 */
const updateEstimatedDelivery = async (req, res, next) => {
    try {
        const { estimatedDelivery } = req.body;

        if (!estimatedDelivery) {
            return next(new AppError('Estimated delivery date is required', HTTP_STATUS.BAD_REQUEST));
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
        }

        order.estimatedDelivery = new Date(estimatedDelivery);
        await order.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Estimated delivery updated',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrderStats,
    updateEstimatedDelivery
};
