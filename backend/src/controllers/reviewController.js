const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { getPagination, createPaginationMeta } = require('../utils/helpers');

/**
 * @desc    Get reviews for a product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
const getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, rating } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const query = {
            product: productId,
            isApproved: true
        };

        if (rating) {
            query.rating = parseInt(rating);
        }

        const reviews = await Review.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Review.countDocuments(query);

        // Calculate average rating
        const ratingStats = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    ratingDistribution: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        let stats = {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };

        if (ratingStats.length > 0) {
            const stat = ratingStats[0];
            stats.averageRating = Math.round(stat.averageRating * 10) / 10;
            stats.totalReviews = stat.totalReviews;

            // Calculate distribution
            stat.ratingDistribution.forEach(rating => {
                stats.ratingDistribution[rating] = (stats.ratingDistribution[rating] || 0) + 1;
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                reviews,
                stats,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create review
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res, next) => {
    try {
        const { productId, rating, title, comment } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            user: req.user._id
        });

        if (existingReview) {
            return next(new AppError('You have already reviewed this product. Multiple reviews are not permitted.', HTTP_STATUS.BAD_REQUEST));
        }

        // Check if user purchased this product (for verified badge)
        const hasPurchased = await Order.findOne({
            user: req.user._id,
            'items.product': productId,
            orderStatus: { $in: ['processing', 'completed'] }
        });

        // Create review
        const review = await Review.create({
            product: productId,
            user: req.user._id,
            rating,
            title: title?.trim(),
            comment: comment?.trim(),
            isVerified: !!hasPurchased
        });

        await review.populate('user', 'name email');

        // Update product rating (calculate average)
        await updateProductRating(productId);

        // Award loyalty points for review
        const { awardPointsForReview } = require('../controllers/loyaltyController');
        const pointsEarned = await awardPointsForReview(req.user._id, productId);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: pointsEarned > 0 ? `Review created! You earned ${pointsEarned} points` : 'Review created successfully',
            data: { review, pointsEarned }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = async (req, res, next) => {
    try {
        const { rating, title, comment } = req.body;

        const review = await Review.findById(req.params.id);

        if (!review) {
            return next(new AppError('Review not found', HTTP_STATUS.NOT_FOUND));
        }

        // Check ownership
        if (review.user.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized to update this review', HTTP_STATUS.FORBIDDEN));
        }

        // Update review
        if (rating !== undefined) review.rating = rating;
        if (title !== undefined) review.title = title?.trim();
        if (comment !== undefined) review.comment = comment?.trim();

        await review.save();
        await review.populate('user', 'name email');

        // Update product rating
        await updateProductRating(review.product);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Review updated successfully',
            data: { review }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return next(new AppError('Review not found', HTTP_STATUS.NOT_FOUND));
        }

        // Check ownership or admin
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
        }

        const productId = review.product;
        await review.deleteOne();

        // Update product rating
        await updateProductRating(productId);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Helper: Update product average rating
 */
const updateProductRating = async (productId) => {
    try {
        const stats = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(productId, {
                $set: {
                    averageRating: Math.round(stats[0].averageRating * 10) / 10,
                    totalReviews: stats[0].totalReviews
                }
            });
        }
    } catch (error) {
        // Don't throw, just log
        console.error('Error updating product rating:', error);
    }
};

/**
 * @desc    Get reviews for home page slider
 * @route   GET /api/reviews/slider
 * @access  Public
 */
const getSliderReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ showInSlider: true, isApproved: true })
            .populate('user', 'name')
            .populate('product', 'name images')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { reviews }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    getSliderReviews
};
