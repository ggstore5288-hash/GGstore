const PromoCode = require('../models/PromoCode');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Get promo code statistics (Admin)
 * @route   GET /api/admin/promo-codes/stats
 * @access  Private/Admin
 */
const getPromoCodeStats = async (req, res, next) => {
    try {
        const promoCodeId = req.params.id;

        if (!promoCodeId) {
            // Get all promo codes stats
            const totalCodes = await PromoCode.countDocuments();
            const activeCodes = await PromoCode.countDocuments({ isActive: true });
            const expiredCodes = await PromoCode.countDocuments({
                expirationDate: { $lt: new Date() }
            });

            const totalUsage = await PromoCode.aggregate([
                { $group: { _id: null, total: { $sum: '$usedCount' } } }
            ]);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: {
                    totalCodes,
                    activeCodes,
                    expiredCodes,
                    totalUsage: totalUsage[0]?.total || 0
                }
            });
        } else {
            // Get specific promo code stats
            const promoCode = await PromoCode.findById(promoCodeId);
            if (!promoCode) {
                return next(new AppError('Promo code not found', HTTP_STATUS.NOT_FOUND));
            }

            // Get orders using this promo code
            const orders = await Order.find({ promoCode: promoCodeId })
                .select('total discount createdAt')
                .sort({ createdAt: -1 })
                .limit(100);

            const totalDiscount = orders.reduce((sum, order) => sum + (order.discount || 0), 0);
            const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: {
                    promoCode,
                    usage: {
                        totalOrders: orders.length,
                        totalDiscount,
                        totalRevenue,
                        averageDiscount: orders.length > 0 ? totalDiscount / orders.length : 0
                    },
                    recentOrders: orders.slice(0, 10)
                }
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPromoCodeStats
};
