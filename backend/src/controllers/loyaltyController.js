const LoyaltyPoint = require('../models/LoyaltyPoint');
const LoyaltySettings = require('../models/LoyaltySettings');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { getPagination, createPaginationMeta } = require('../utils/helpers');

/**
 * @desc    Get user's loyalty points
 * @route   GET /api/loyalty
 * @access  Private
 */
const getLoyaltyPoints = async (req, res, next) => {
    try {
        let loyalty = await LoyaltyPoint.findOne({ user: req.user._id });

        if (!loyalty) {
            loyalty = await LoyaltyPoint.create({
                user: req.user._id,
                points: 0
            });
        }

        const settings = await LoyaltySettings.getSettings();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                loyalty,
                settings: {
                    pointsToMoneyRatio: settings.pointsToMoneyRatio,
                    minPointsToRedeem: settings.minPointsToRedeem,
                    maxRedemptionPerOrder: settings.maxRedemptionPerOrder
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get loyalty leaderboard
 * @route   GET /api/loyalty/leaderboard
 * @access  Public
 */
const getLeaderboard = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const limitNum = Math.min(parseInt(limit) || 10, 50);

        const leaderboard = await LoyaltyPoint.find()
            .populate('user', 'name email')
            .sort({ totalEarned: -1 })
            .limit(limitNum)
            .select('user points totalEarned tier');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { leaderboard }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get loyalty settings
 * @route   GET /api/loyalty/settings
 * @access  Private/Admin
 */
const getLoyaltySettings = async (req, res, next) => {
    try {
        const settings = await LoyaltySettings.getSettings();
        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { settings }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update loyalty settings
 * @route   PUT /api/loyalty/settings
 * @access  Private/Admin
 */
const updateLoyaltySettings = async (req, res, next) => {
    try {
        let settings = await LoyaltySettings.findOne();
        if (!settings) {
            settings = new LoyaltySettings();
        }

        const allowedFields = [
            'pointsPerDollar', 'pointsToMoneyRatio', 'minPointsToRedeem',
            'maxRedemptionPerOrder', 'pointsExpiryDays', 'tierThresholds',
            'tierMultipliers', 'bonusPoints', 'isActive'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        });

        if (req.user) {
            settings.updatedBy = req.user._id;
        }

        await settings.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Loyalty settings updated',
            data: { settings }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Award points for order (called after order completion)
 */
const awardPointsForOrder = async (userId, order) => {
    try {
        const settings = await LoyaltySettings.getSettings();
        if (!settings.isActive) return 0;

        let loyalty = await LoyaltyPoint.findOne({ user: userId });
        if (!loyalty) {
            loyalty = await LoyaltyPoint.create({ user: userId });
        }

        // Calculate points based on tier multiplier
        const tierMultiplier = settings.tierMultipliers[loyalty.tier] || 1;
        const basePoints = Math.floor(order.total * settings.pointsPerDollar);
        const totalPoints = Math.floor(basePoints * tierMultiplier);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + settings.pointsExpiryDays);

        loyalty.points += totalPoints;
        loyalty.totalEarned += totalPoints;
        loyalty.transactions.push({
            type: 'earned',
            amount: totalPoints,
            description: `Points for order ${order.orderNumber} (${loyalty.tier} tier bonus)`,
            order: order._id,
            expiresAt
        });

        // First purchase bonus
        if (loyalty.transactions.filter(t => t.type === 'earned').length === 1 && settings.bonusPoints.firstPurchase > 0) {
            const bonus = settings.bonusPoints.firstPurchase;
            loyalty.points += bonus;
            loyalty.totalEarned += bonus;
            loyalty.transactions.push({
                type: 'earned',
                amount: bonus,
                description: 'First purchase bonus',
                expiresAt
            });
        }

        loyalty.updateTier();
        await loyalty.save();

        return totalPoints;
    } catch (error) {
        console.error('Error awarding loyalty points:', error);
        return 0;
    }
};

/**
 * Award points for review
 */
const awardPointsForReview = async (userId, productId) => {
    try {
        const settings = await LoyaltySettings.getSettings();
        if (!settings.isActive || settings.bonusPoints.review <= 0) return 0;

        let loyalty = await LoyaltyPoint.findOne({ user: userId });
        if (!loyalty) {
            loyalty = await LoyaltyPoint.create({ user: userId });
        }

        // Check if already awarded for this product (optional, but good practice)
        // For simplicity, we assume one review per product per user (enforced by reviewController)

        const points = settings.bonusPoints.review;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + settings.pointsExpiryDays);

        loyalty.points += points;
        loyalty.totalEarned += points;
        loyalty.transactions.push({
            type: 'earned',
            amount: points,
            description: 'Points for product review',
            expiresAt
        });

        loyalty.updateTier();
        await loyalty.save();

        return points;
    } catch (error) {
        console.error('Error awarding review points:', error);
        return 0;
    }
};

/**
 * Redeem points (convert to discount)
 */
const redeemPoints = async (userId, pointsToRedeem) => {
    try {
        const settings = await LoyaltySettings.getSettings();
        if (!settings.isActive) return { success: false, message: 'Loyalty program inactive' };

        if (pointsToRedeem < settings.minPointsToRedeem) {
            return { success: false, message: `Minimum redemption is ${settings.minPointsToRedeem} points` };
        }

        const loyalty = await LoyaltyPoint.findOne({ user: userId });

        if (!loyalty || loyalty.points < pointsToRedeem) {
            return { success: false, message: 'Insufficient points' };
        }

        // Calculate discount
        const discountAmount = pointsToRedeem / settings.pointsToMoneyRatio;

        if (settings.maxRedemptionPerOrder > 0 && discountAmount > settings.maxRedemptionPerOrder) {
            return { success: false, message: `Maximum discount is $${settings.maxRedemptionPerOrder}` };
        }

        loyalty.points -= pointsToRedeem;
        loyalty.totalSpent += pointsToRedeem;
        loyalty.transactions.push({
            type: 'spent',
            amount: pointsToRedeem,
            description: `Redeemed ${pointsToRedeem} points`,
            expiresAt: null
        });

        await loyalty.save();

        return {
            success: true,
            discountAmount,
            remainingPoints: loyalty.points
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

/**
 * @desc    Adjust user points (Admin)
 * @route   POST /api/loyalty/adjust
 * @access  Private/Admin
 */
const adjustPoints = async (req, res, next) => {
    try {
        const { userId, points, reason } = req.body;

        let loyalty = await LoyaltyPoint.findOne({ user: userId });
        if (!loyalty) {
            loyalty = await LoyaltyPoint.create({ user: userId });
        }

        const amount = parseInt(points);
        if (isNaN(amount) || amount === 0) {
            return next(new AppError('Invalid points amount', HTTP_STATUS.BAD_REQUEST));
        }

        loyalty.points += amount;
        if (amount > 0) {
            loyalty.totalEarned += amount;
        }

        if (loyalty.points < 0) loyalty.points = 0;

        loyalty.transactions.push({
            type: amount > 0 ? 'earned' : 'spent',
            amount: Math.abs(amount),
            description: reason || 'Admin adjustment',
            expiresAt: amount > 0 ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null
        });

        loyalty.updateTier();
        await loyalty.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Points adjusted successfully',
            data: { loyalty }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all loyalty records (Admin)
 * @route   GET /api/loyalty/all
 * @access  Private/Admin
 */
const getAllLoyalty = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, tier, minPoints } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const query = {};
        if (tier) query.tier = tier;
        if (minPoints) query.points = { $gte: parseInt(minPoints) };

        const loyaltyPoints = await LoyaltyPoint.find(query)
            .populate('user', 'name email')
            .sort({ points: -1 })
            .skip(skip)
            .limit(limitNum);

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
 * @desc    Redeem points (User API)
 * @route   POST /api/loyalty/redeem
 * @access  Private
 */
const redeemPointsHandler = async (req, res, next) => {
    try {
        const { points } = req.body;
        if (!points || points <= 0) {
            return next(new AppError('Invalid points amount', HTTP_STATUS.BAD_REQUEST));
        }

        const result = await redeemPoints(req.user._id, parseInt(points));

        if (!result.success) {
            return next(new AppError(result.message, HTTP_STATUS.BAD_REQUEST));
        }

        // TODO: In a real app, we might generate a coupon code here
        // For now, we just deduct points and return success (assuming used in checkout logic)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Redeemed ${points} points`,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLoyaltyPoints,
    getLeaderboard,
    getLoyaltySettings,
    updateLoyaltySettings,
    awardPointsForOrder,
    awardPointsForReview,
    redeemPoints,
    redeemPointsHandler,
    adjustPoints,
    getAllLoyalty
};
