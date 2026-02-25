const Product = require('../models/Product');
const Order = require('../models/Order');
const RecentlyViewed = require('../models/RecentlyViewed');
const Wishlist = require('../models/Wishlist');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Get product recommendations for user
 * @route   GET /api/recommendations
 * @access  Private
 */
const getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { limit = 10 } = req.query;
        const limitNum = Math.min(parseInt(limit) || 10, 20);

        // Get user's purchase history
        const userOrders = await Order.find({ user: userId })
            .select('items.product')
            .limit(10);

        const purchasedProductIds = new Set();
        userOrders.forEach(order => {
            order.items.forEach(item => {
                purchasedProductIds.add(item.product.toString());
            });
        });

        // Get user's recently viewed products
        const recentlyViewed = await RecentlyViewed.findOne({ user: userId });
        const viewedProductIds = recentlyViewed?.products.map(p => p.product.toString()) || [];

        // Get user's wishlist
        const wishlist = await Wishlist.findOne({ user: userId });
        const wishlistProductIds = wishlist?.products.map(p => p.product.toString()) || [];

        // Combine all user's product interests
        const userProductIds = [
            ...Array.from(purchasedProductIds),
            ...viewedProductIds,
            ...wishlistProductIds
        ];

        // Get categories and tags from user's products
        const userProducts = await Product.find({
            _id: { $in: userProductIds },
            isActive: true
        }).select('category tags type platform');

        const userCategories = new Set();
        const userTags = new Set();
        const userTypes = new Set();
        const userPlatforms = new Set();

        userProducts.forEach(product => {
            if (product.category) userCategories.add(product.category.toString());
            if (product.tags) product.tags.forEach(tag => userTags.add(tag));
            if (product.type) userTypes.add(product.type);
            if (product.platform) userPlatforms.add(product.platform);
        });

        // Build recommendation query
        const excludeIds = [...userProductIds];
        const query = {
            _id: { $nin: excludeIds },
            isActive: true
        };

        // Find similar products
        const recommendations = await Product.find({
            $or: [
                { category: { $in: Array.from(userCategories) } },
                { tags: { $in: Array.from(userTags) } },
                { type: { $in: Array.from(userTypes) } },
                { platform: { $in: Array.from(userPlatforms) } }
            ],
            ...query
        })
        .sort({ purchaseCount: -1, viewCount: -1, averageRating: -1 })
        .limit(limitNum * 2) // Get more to filter
        .select('name price discountPrice images averageRating totalReviews');

        // If not enough recommendations, add trending products
        if (recommendations.length < limitNum) {
            const trending = await Product.find({
                _id: { $nin: [...excludeIds, ...recommendations.map(p => p._id)] },
                isActive: true
            })
            .sort({ viewCount: -1, purchaseCount: -1 })
            .limit(limitNum - recommendations.length)
            .select('name price discountPrice images averageRating totalReviews');

            recommendations.push(...trending);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                recommendations: recommendations.slice(0, limitNum),
                basedOn: {
                    purchases: purchasedProductIds.size,
                    views: viewedProductIds.length,
                    wishlist: wishlistProductIds.length
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get "You may also like" for a specific product
 * @route   GET /api/recommendations/product/:productId
 * @access  Public
 */
const getProductRecommendations = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { limit = 6 } = req.query;
        const limitNum = Math.min(parseInt(limit) || 6, 12);

        // Get the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { recommendations: [] }
            });
        }

        // Find similar products
        const recommendations = await Product.find({
            _id: { $ne: productId },
            isActive: true,
            $or: [
                { category: product.category },
                { tags: { $in: product.tags || [] } },
                { type: product.type },
                { platform: product.platform }
            ]
        })
        .sort({ purchaseCount: -1, averageRating: -1 })
        .limit(limitNum)
        .select('name price discountPrice images averageRating totalReviews');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { recommendations }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get trending products
 * @route   GET /api/recommendations/trending
 * @access  Public
 */
const getTrendingProducts = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const limitNum = Math.min(parseInt(limit) || 10, 20);

        // Get products sorted by views and purchases (last 7 days weight more)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trending = await Product.find({
            isActive: true
        })
        .sort({ 
            viewCount: -1,
            purchaseCount: -1,
            averageRating: -1
        })
        .limit(limitNum)
        .select('name price discountPrice images averageRating totalReviews viewCount purchaseCount');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { products: trending }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get popular products
 * @route   GET /api/recommendations/popular
 * @access  Public
 */
const getPopularProducts = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const limitNum = Math.min(parseInt(limit) || 10, 20);

        const popular = await Product.find({
            isActive: true
        })
        .sort({ purchaseCount: -1, averageRating: -1 })
        .limit(limitNum)
        .select('name price discountPrice images averageRating totalReviews purchaseCount');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { products: popular }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRecommendations,
    getProductRecommendations,
    getTrendingProducts,
    getPopularProducts
};
