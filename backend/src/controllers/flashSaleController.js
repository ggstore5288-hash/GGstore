const Product = require('../models/Product');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { getPagination, createPaginationMeta } = require('../utils/helpers');

/**
 * @desc    Get active flash sales
 * @route   GET /api/flash-sales
 * @access  Public
 */
const getFlashSales = async (req, res, next) => {
    try {
        const now = new Date();

        const flashSales = await Product.find({
            isFlashSale: true,
            isActive: true,
            flashSaleEndsAt: { $gt: now }
        })
            .populate('category', 'name')
            .sort({ flashSaleEndsAt: 1 }) // Ending soon first
            .select('name price discountPrice images flashSaleEndsAt viewCount purchaseCount averageRating');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { flashSales }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create/Update flash sale (Admin)
 * @route   POST /api/flash-sales
 * @access  Private/Admin
 */
const createFlashSale = async (req, res, next) => {
    try {
        const { productId, discountPrice, endsAt } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        product.isFlashSale = true;
        product.discountPrice = discountPrice;
        product.flashSaleEndsAt = new Date(endsAt);

        await product.save();
        await product.populate('category', 'name');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Flash sale created',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    End flash sale (Admin)
 * @route   DELETE /api/flash-sales/:productId
 * @access  Private/Admin
 */
const endFlashSale = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        product.isFlashSale = false;
        product.flashSaleEndsAt = null;
        product.discountPrice = null;

        await product.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Flash sale ended',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFlashSales,
    createFlashSale,
    endFlashSale
};
