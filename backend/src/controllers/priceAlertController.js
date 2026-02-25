const PriceAlert = require('../models/PriceAlert');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Create price alert
 * @route   POST /api/price-alerts
 * @access  Private
 */
const createPriceAlert = async (req, res, next) => {
    try {
        const { productId, targetPrice } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        const currentPrice = product.discountPrice || product.price;

        // Check if alert already exists
        let alert = await PriceAlert.findOne({
            user: req.user._id,
            product: productId
        });

        if (alert) {
            // Update existing alert
            alert.targetPrice = targetPrice;
            alert.currentPrice = currentPrice;
            alert.isActive = true;
            alert.notified = false;
            await alert.save();
        } else {
            // Create new alert
            alert = await PriceAlert.create({
                user: req.user._id,
                product: productId,
                targetPrice,
                currentPrice
            });
        }

        await alert.populate('product', 'name price discountPrice images');

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Price alert created',
            data: { alert }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's price alerts
 * @route   GET /api/price-alerts
 * @access  Private
 */
const getPriceAlerts = async (req, res, next) => {
    try {
        const alerts = await PriceAlert.find({
            user: req.user._id,
            isActive: true
        })
        .populate('product', 'name price discountPrice images')
        .sort({ createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { alerts }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete price alert
 * @route   DELETE /api/price-alerts/:id
 * @access  Private
 */
const deletePriceAlert = async (req, res, next) => {
    try {
        const alert = await PriceAlert.findById(req.params.id);

        if (!alert) {
            return next(new AppError('Price alert not found', HTTP_STATUS.NOT_FOUND));
        }

        if (alert.user.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
        }

        await alert.deleteOne();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Price alert deleted'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Check and notify price drops (called by cron job or admin)
 * @route   POST /api/price-alerts/check
 * @access  Private/Admin
 */
const checkPriceDrops = async (req, res, next) => {
    try {
        const activeAlerts = await PriceAlert.find({
            isActive: true,
            notified: false
        }).populate('product');

        const notifications = [];

        for (const alert of activeAlerts) {
            const product = alert.product;
            const currentPrice = product.discountPrice || product.price;

            // Check if price dropped to or below target
            if (currentPrice <= alert.targetPrice && currentPrice < alert.currentPrice) {
                alert.notified = true;
                alert.notifiedAt = new Date();
                alert.currentPrice = currentPrice;
                await alert.save();

                notifications.push({
                    alertId: alert._id,
                    productId: product._id,
                    productName: product.name,
                    oldPrice: alert.currentPrice,
                    newPrice: currentPrice,
                    targetPrice: alert.targetPrice
                });
            } else if (currentPrice !== alert.currentPrice) {
                // Update current price even if not reached target
                alert.currentPrice = currentPrice;
                await alert.save();
            }
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Checked ${activeAlerts.length} alerts, ${notifications.length} price drops found`,
            data: { notifications }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPriceAlert,
    getPriceAlerts,
    deletePriceAlert,
    checkPriceDrops
};
