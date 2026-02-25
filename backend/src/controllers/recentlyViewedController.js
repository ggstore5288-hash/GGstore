const RecentlyViewed = require('../models/RecentlyViewed');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Track product view
 * @route   POST /api/recently-viewed
 * @access  Private
 */
const trackProductView = async (req, res, next) => {
    try {
        const { productId } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        // Get or create recently viewed
        let recentlyViewed = await RecentlyViewed.findOne({ user: req.user._id });

        if (!recentlyViewed) {
            recentlyViewed = await RecentlyViewed.create({
                user: req.user._id,
                products: [{ product: productId }]
            });
        } else {
            // Remove if already exists
            recentlyViewed.products = recentlyViewed.products.filter(
                item => item.product.toString() !== productId
            );

            // Add to beginning (most recent first)
            recentlyViewed.products.unshift({ product: productId });

            // Keep only last 20 products
            if (recentlyViewed.products.length > 20) {
                recentlyViewed.products = recentlyViewed.products.slice(0, 20);
            }

            await recentlyViewed.save();
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Product view tracked'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get recently viewed products
 * @route   GET /api/recently-viewed
 * @access  Private
 */
const getRecentlyViewed = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const limitNum = Math.min(parseInt(limit) || 10, 20);

        let recentlyViewed = await RecentlyViewed.findOne({ user: req.user._id })
            .populate({
                path: 'products.product',
                match: { isActive: true } // Only show active products
            });

        if (!recentlyViewed) {
            recentlyViewed = { products: [] };
        }

        // Filter out null products (inactive ones)
        const products = recentlyViewed.products
            .filter(item => item.product !== null)
            .slice(0, limitNum)
            .map(item => item.product);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { products }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Clear recently viewed
 * @route   DELETE /api/recently-viewed
 * @access  Private
 */
const clearRecentlyViewed = async (req, res, next) => {
    try {
        const recentlyViewed = await RecentlyViewed.findOne({ user: req.user._id });

        if (recentlyViewed) {
            recentlyViewed.products = [];
            await recentlyViewed.save();
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Recently viewed cleared'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    trackProductView,
    getRecentlyViewed,
    clearRecentlyViewed
};
