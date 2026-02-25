const Product = require('../models/Product');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Compare multiple products
 * @route   POST /api/compare
 * @access  Public
 */
const compareProducts = async (req, res, next) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds) || productIds.length < 2) {
            return next(new AppError('At least 2 products required for comparison', HTTP_STATUS.BAD_REQUEST));
        }

        if (productIds.length > 4) {
            return next(new AppError('Maximum 4 products can be compared', HTTP_STATUS.BAD_REQUEST));
        }

        const products = await Product.find({
            _id: { $in: productIds },
            isActive: true
        })
        .populate('category', 'name')
        .select('name description price discountPrice images platform region type stock averageRating totalReviews viewCount purchaseCount tags');

        if (products.length !== productIds.length) {
            return next(new AppError('Some products not found', HTTP_STATUS.NOT_FOUND));
        }

        // Format comparison data
        const comparison = {
            products: products.map(p => ({
                id: p._id,
                name: p.name,
                description: p.description,
                price: p.price,
                discountPrice: p.discountPrice,
                effectivePrice: p.discountPrice || p.price,
                discountPercentage: p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0,
                images: p.images,
                platform: p.platform,
                region: p.region,
                type: p.type,
                stock: p.stock,
                averageRating: p.averageRating,
                totalReviews: p.totalReviews,
                viewCount: p.viewCount,
                purchaseCount: p.purchaseCount,
                tags: p.tags,
                category: p.category
            })),
            comparedAt: new Date()
        };

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { comparison }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    compareProducts
};
