const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const PriceAlert = require('../models/PriceAlert');
const LoyaltyPoint = require('../models/LoyaltyPoint');
const Settings = require('../models/Settings');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { getPagination, createPaginationMeta } = require('../utils/helpers');
const mongoose = require('mongoose');

/**
 * @desc    Get comprehensive admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getAdminStats = async (req, res, next) => {
    try {
        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0));
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Total counts
        const [
            totalProducts,
            totalUsers,
            totalOrders,
            totalPayments,
            totalReviews,
            activeFlashSales,
            activePriceAlerts,
            totalLoyaltyUsers
        ] = await Promise.all([
            Product.countDocuments(),
            User.countDocuments(),
            Order.countDocuments(),
            Payment.countDocuments(),
            Review.countDocuments(),
            Product.countDocuments({ isFlashSale: true, flashSaleEndsAt: { $gt: now } }),
            PriceAlert.countDocuments({ isActive: true }),
            LoyaltyPoint.countDocuments()
        ]);

        // Today's stats
        const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
        const todayRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: today }, paymentStatus: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const todayRevenueAmount = todayRevenue[0]?.total || 0;

        // This month's stats
        const monthOrders = await Order.countDocuments({ createdAt: { $gte: thisMonth } });
        const monthRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: thisMonth }, paymentStatus: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const monthRevenueAmount = monthRevenue[0]?.total || 0;

        // Last month for comparison
        const lastMonthRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: lastMonth, $lt: thisMonth }, paymentStatus: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const lastMonthRevenueAmount = lastMonthRevenue[0]?.total || 0;

        // Pending items
        const pendingOrders = await Order.countDocuments({ orderStatus: 'new' });
        const pendingPayments = await Payment.countDocuments({ status: 'pending' });
        const pendingReviews = await Review.countDocuments({ isApproved: false });

        // Top products
        const topProducts = await Product.find({ isActive: true })
            .sort({ purchaseCount: -1 })
            .limit(5)
            .select('name purchaseCount viewCount averageRating');

        // Recent activity
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .select('orderNumber total orderStatus createdAt');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                overview: {
                    totalProducts,
                    totalUsers,
                    totalOrders,
                    totalPayments,
                    totalReviews,
                    activeFlashSales,
                    activePriceAlerts,
                    totalLoyaltyUsers
                },
                today: {
                    orders: todayOrders,
                    revenue: todayRevenueAmount
                },
                thisMonth: {
                    orders: monthOrders,
                    revenue: monthRevenueAmount,
                    growth: lastMonthRevenueAmount > 0
                        ? ((monthRevenueAmount - lastMonthRevenueAmount) / lastMonthRevenueAmount * 100).toFixed(2)
                        : 0
                },
                pending: {
                    orders: pendingOrders,
                    payments: pendingPayments,
                    reviews: pendingReviews
                },
                topProducts,
                recentOrders
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all price alerts (Admin)
 * @route   GET /api/admin/price-alerts
 * @access  Private/Admin
 */
const getAllPriceAlerts = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, status } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const query = {};
        if (status === 'active') query.isActive = true;
        if (status === 'notified') query.notified = true;

        const alerts = await PriceAlert.find(query)
            .populate('user', 'name email')
            .populate('product', 'name price discountPrice images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await PriceAlert.countDocuments(query);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                alerts,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all loyalty points (Admin)
 * @route   GET /api/admin/loyalty
 * @access  Private/Admin
 */
const getAllLoyaltyPoints = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, tier, minPoints } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const query = {};
        if (tier) query.tier = tier;
        if (minPoints) query.points = { $gte: parseInt(minPoints) };

        const loyaltyPoints = await LoyaltyPoint.find(query)
            .populate('user', 'name email')
            .sort({ totalEarned: -1 })
            .skip(skip)
            .limit(limitNum)
            .select('user points totalEarned totalSpent tier transactions');

        const total = await LoyaltyPoint.countDocuments(query);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                loyaltyPoints,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Adjust user loyalty points (Admin)
 * @route   PATCH /api/admin/loyalty/:userId
 * @access  Private/Admin
 */
const adjustLoyaltyPoints = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { points, reason } = req.body;

        if (!points || typeof points !== 'number') {
            return next(new AppError('Points amount is required', HTTP_STATUS.BAD_REQUEST));
        }

        let loyalty = await LoyaltyPoint.findOne({ user: userId });

        if (!loyalty) {
            loyalty = await LoyaltyPoint.create({ user: userId });
        }

        const oldPoints = loyalty.points;
        loyalty.points = Math.max(0, loyalty.points + points);

        if (points > 0) {
            loyalty.totalEarned += points;
        } else {
            loyalty.totalSpent += Math.abs(points);
        }

        loyalty.transactions.push({
            type: points > 0 ? 'earned' : 'spent',
            amount: Math.abs(points),
            description: reason || `Admin adjustment: ${points > 0 ? '+' : ''}${points} points`,
            expiresAt: null
        });

        loyalty.updateTier();
        await loyalty.save();
        await loyalty.populate('user', 'name email');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Loyalty points ${points > 0 ? 'added' : 'deducted'} successfully`,
            data: {
                loyalty,
                change: points,
                oldPoints,
                newPoints: loyalty.points
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all reviews for moderation (Admin)
 * @route   GET /api/admin/reviews
 * @access  Private/Admin
 */
const getAllReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, approved, rating } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const query = {};
        if (approved === 'true') query.isApproved = true;
        if (approved === 'false') query.isApproved = false;
        if (rating) query.rating = parseInt(rating);

        const reviews = await Review.find(query)
            .populate('user', 'name email')
            .populate('product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Review.countDocuments(query);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                reviews,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Moderate review (Admin)
 * @route   PATCH /api/admin/reviews/:id
 * @access  Private/Admin
 */
const moderateReview = async (req, res, next) => {
    try {
        const { isApproved, showInSlider } = req.body;

        const review = await Review.findById(req.params.id);
        if (!review) {
            return next(new AppError('Review not found', HTTP_STATUS.NOT_FOUND));
        }

        review.isApproved = isApproved !== undefined ? isApproved : review.isApproved;
        if (showInSlider !== undefined) review.showInSlider = showInSlider;
        await review.save();

        // Update product rating if approved status changed
        if (isApproved !== undefined) {
            const Product = require('../models/Product');
            const stats = await Review.aggregate([
                { $match: { product: review.product, isApproved: true } },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 }
                    }
                }
            ]);

            if (stats.length > 0) {
                await Product.findByIdAndUpdate(review.product, {
                    averageRating: Math.round(stats[0].averageRating * 10) / 10,
                    totalReviews: stats[0].totalReviews
                });
            }
        }

        await review.populate('user', 'name email');
        await review.populate('product', 'name');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Review ${review.isApproved ? 'approved' : 'rejected'}`,
            data: { review }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Bulk update products (Admin)
 * @route   POST /api/admin/products/bulk
 * @access  Private/Admin
 */
const bulkUpdateProducts = async (req, res, next) => {
    try {
        const { productIds, updates } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return next(new AppError('Product IDs array is required', HTTP_STATUS.BAD_REQUEST));
        }

        if (!updates || typeof updates !== 'object') {
            return next(new AppError('Updates object is required', HTTP_STATUS.BAD_REQUEST));
        }

        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            { $set: updates }
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `${result.modifiedCount} products updated`,
            data: {
                matched: result.matchedCount,
                modified: result.modifiedCount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Bulk delete products (Admin)
 * @route   DELETE /api/admin/products/bulk
 * @access  Private/Admin
 */
const bulkDeleteProducts = async (req, res, next) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return next(new AppError('Product IDs array is required', HTTP_STATUS.BAD_REQUEST));
        }

        const result = await Product.deleteMany({ _id: { $in: productIds } });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `${result.deletedCount} products deleted`,
            data: { deletedCount: result.deletedCount }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get system settings
 * @route   GET /api/admin/settings
 * @access  Private/Admin
 */
const getSettings = async (req, res, next) => {
    try {
        const { category } = req.query;

        const query = {};
        if (category) query.category = category;

        const settings = await Settings.find(query).sort({ category: 1, key: 1 });

        // Group by category
        const grouped = settings.reduce((acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push(setting);
            return acc;
        }, {});

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                settings: grouped,
                flat: settings
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update system setting
 * @route   PUT /api/admin/settings/:key
 * @access  Private/Admin
 */
const updateSetting = async (req, res, next) => {
    try {
        const { key } = req.params;
        const { value, description, isPublic, category } = req.body;

        let setting = await Settings.findOne({ key });

        if (!setting) {
            setting = await Settings.create({
                key,
                value,
                type: typeof value === 'string' ? 'string' : typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'object',
                description,
                category: category || 'General',
                isPublic: isPublic || false
            });
        } else {
            if (value !== undefined) setting.value = value;
            if (description !== undefined) setting.description = description;
            if (isPublic !== undefined) setting.isPublic = isPublic;
            if (category !== undefined) setting.category = category;
            await setting.save();
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Setting updated successfully',
            data: { setting }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get analytics data
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
const getAnalytics = async (req, res, next) => {
    try {
        const { period = '30' } = req.query; // days
        const days = parseInt(period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Sales analytics
        const salesData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'confirmed'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Product performance
        const productPerformance = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'confirmed'
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 }
        ]);

        const productIds = productPerformance.map(p => p._id);
        const products = await Product.find({ _id: { $in: productIds } })
            .select('name images');

        const productPerformanceWithNames = productPerformance.map(perf => {
            const product = products.find(p => p._id.toString() === perf._id.toString());
            return {
                productId: perf._id,
                productName: product?.name || 'Unknown',
                productImage: product?.images[0] || null,
                totalSold: perf.totalSold,
                revenue: perf.revenue
            };
        });

        // User growth
        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Category performance
        const categoryPerformance = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'confirmed'
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $group: {
                    _id: '$category._id',
                    categoryName: { $first: '$category.name' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        // Time distribution (Sales by hour and day)
        const timeDistribution = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'confirmed'
                }
            },
            {
                $group: {
                    _id: {
                        dayOfWeek: { $dayOfWeek: '$createdAt' },
                        hour: { $hour: '$createdAt' }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            }
        ]);

        // VIP Customers
        const topCustomers = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'confirmed'
                }
            },
            {
                $group: {
                    _id: '$user',
                    totalSpent: { $sum: '$total' },
                    orderCount: { $sum: 1 },
                    lastOrder: { $max: '$createdAt' }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    totalSpent: 1,
                    orderCount: 1,
                    lastOrder: 1,
                    name: '$user.name',
                    email: '$user.email'
                }
            }
        ]);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                period: days,
                salesData,
                productPerformance: productPerformanceWithNames,
                userGrowth,
                categoryPerformance,
                timeDistribution,
                topCustomers
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all wishlists (Admin)
 * @route   GET /api/admin/wishlists
 * @access  Private/Admin
 */
const getAllWishlists = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const wishlists = await Wishlist.find()
            .populate('user', 'name email')
            .populate('products.product', 'name price discountPrice images')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Wishlist.countDocuments();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                wishlists,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all recently viewed (Admin)
 * @route   GET /api/admin/recently-viewed
 * @access  Private/Admin
 */
const getAllRecentlyViewed = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const recentlyViewed = await require('../models/RecentlyViewed').find()
            .populate('user', 'name email')
            .populate('products.product', 'name price images')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await require('../models/RecentlyViewed').countDocuments();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                recentlyViewed,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};



module.exports = {
    getAdminStats,
    getAllPriceAlerts,
    getAllLoyaltyPoints,
    adjustLoyaltyPoints,
    getAllReviews,
    moderateReview,
    bulkUpdateProducts,
    bulkDeleteProducts,
    getSettings,
    updateSetting,
    getAnalytics,
    getAllWishlists,
    getAllRecentlyViewed
};
