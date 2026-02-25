const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Get user wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate('products.product');

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { wishlist }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        // Get or create wishlist
        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user._id,
                products: [{ product: productId }]
            });
        } else {
            // Check if product already in wishlist
            const existingProduct = wishlist.products.find(
                item => item.product.toString() === productId
            );

            if (existingProduct) {
                return next(new AppError('Product already in wishlist', HTTP_STATUS.BAD_REQUEST));
            }

            // Add product
            wishlist.products.push({ product: productId });
            await wishlist.save();
        }

        await wishlist.populate('products.product');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Product added to wishlist',
            data: { wishlist }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return next(new AppError('Wishlist not found', HTTP_STATUS.NOT_FOUND));
        }

        // Remove product
        wishlist.products = wishlist.products.filter(
            item => item.product.toString() !== productId
        );

        await wishlist.save();
        await wishlist.populate('products.product');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Product removed from wishlist',
            data: { wishlist }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Check if product is in wishlist
 * @route   GET /api/wishlist/check/:productId
 * @access  Private
 */
const checkWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        const isInWishlist = wishlist?.products.some(
            item => item.product.toString() === productId
        ) || false;

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { isInWishlist }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist
};
