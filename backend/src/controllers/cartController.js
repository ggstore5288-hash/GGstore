const Cart = require('../models/Cart');
const Product = require('../models/Product');
const PromoCode = require('../models/PromoCode');
const LoyaltyPoint = require('../models/LoyaltyPoint');
const LoyaltySettings = require('../models/LoyaltySettings');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { calculateOrderTotals } = require('../services/calculationService');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product')
            .populate('promoCode');

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { cart }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
    try {
        let { productId, quantity, variant } = req.body;

        // Default quantity to 1 if not provided
        quantity = quantity ? parseInt(quantity) : 1;

        // Check product exists and is active
        const product = await Product.findById(productId);
        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }
        if (!product.isActive) {
            return next(new AppError('Product is not available', HTTP_STATUS.BAD_REQUEST));
        }
        if (product.stock < quantity) {
            return next(new AppError('Insufficient stock', HTTP_STATUS.BAD_REQUEST));
        }

        // Validate variant if provided
        let price = product.discountPrice || product.price;
        let variantInfo = null;

        if (variant) {
            // In a robust system we should verify the variant exists in product.variants and matches price.
            // For now we trust the info but ideally we check:
            if (product.variants && product.variants.length > 0) {
                const matchingVariant = product.variants.find(v => v.type === variant.type);
                if (matchingVariant) {
                    price = matchingVariant.price; // Use variant price
                    variantInfo = { type: matchingVariant.type, price: matchingVariant.price };
                } else {
                    // Invalid variant passed ?? fallback or error. Let's error strictly if variant intended.
                    // But user might add base product? No, if variants exist user MUST pick one (frontend enforced).
                    // If backend enforced:
                    // return next(new AppError('Selected option is invalid', HTTP_STATUS.BAD_REQUEST));
                }
            }
        }

        // Get or create cart
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        // Check if product already in cart (SAME VARIANT)
        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId &&
                ((!item.variant && !variantInfo) || (item.variant && variantInfo && item.variant.type === variantInfo.type))
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].price = price; // Update price in case it changed
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price,
                variant: variantInfo
            });
        }

        // Recalculate totals
        cart.calculateTotals();
        await cart.save();
        await cart.populate('items.product');
        await cart.populate('promoCode');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Item added to cart',
            data: { cart }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return next(new AppError('Cart not found', HTTP_STATUS.NOT_FOUND));
        }

        const item = cart.items.id(itemId);
        if (!item) {
            return next(new AppError('Item not found in cart', HTTP_STATUS.NOT_FOUND));
        }

        // Check stock
        const product = await Product.findById(item.product);
        if (product.stock < quantity) {
            return next(new AppError('Insufficient stock', HTTP_STATUS.BAD_REQUEST));
        }

        item.quantity = quantity;
        cart.calculateTotals();
        await cart.save();
        await cart.populate('items.product');
        await cart.populate('promoCode');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cart updated',
            data: { cart }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return next(new AppError('Cart not found', HTTP_STATUS.NOT_FOUND));
        }

        cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
        cart.calculateTotals();
        await cart.save();
        await cart.populate('items.product');
        await cart.populate('promoCode');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Item removed from cart',
            data: { cart }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return next(new AppError('Cart not found', HTTP_STATUS.NOT_FOUND));
        }

        cart.items = [];
        cart.subtotal = 0;
        cart.discount = 0;
        cart.total = 0;
        cart.promoCode = null;
        await cart.save();
        await cart.populate('promoCode');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Cart cleared',
            data: { cart }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Apply promo code to cart
 * @route   POST /api/cart/promo-code
 * @access  Private
 */
const applyPromoCode = async (req, res, next) => {
    try {
        const { code } = req.body;

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            return next(new AppError('Cart not found', HTTP_STATUS.NOT_FOUND));
        }

        if (cart.items.length === 0) {
            return next(new AppError('Cart is empty', HTTP_STATUS.BAD_REQUEST));
        }

        // Find promo code
        const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });
        if (!promoCode) {
            return next(new AppError('Invalid promo code', HTTP_STATUS.NOT_FOUND));
        }

        // Validate promo code
        const validation = promoCode.isValid();
        if (!validation.valid) {
            return next(new AppError(validation.message, HTTP_STATUS.BAD_REQUEST));
        }

        // Check minimum purchase amount
        if (cart.subtotal < promoCode.minPurchaseAmount) {
            return next(
                new AppError(
                    `Minimum purchase amount of ${promoCode.minPurchaseAmount} required`,
                    HTTP_STATUS.BAD_REQUEST
                )
            );
        }

        // Apply promo code
        cart.promoCode = promoCode._id;
        cart.discount = promoCode.calculateDiscount(cart.subtotal);
        cart.calculateTotals();
        await cart.save();
        await cart.populate('promoCode');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Promo code applied',
            data: { cart }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Redeem loyalty points
 * @route   POST /api/cart/redeem-points
 * @access  Private
 */
const redeemPoints = async (req, res, next) => {
    try {
        const { points } = req.body;
        const pointsToRedeem = parseInt(points);

        if (isNaN(pointsToRedeem) || pointsToRedeem <= 0) {
            return next(new AppError('Invalid points amount', HTTP_STATUS.BAD_REQUEST));
        }

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            return next(new AppError('Cart not found', HTTP_STATUS.NOT_FOUND));
        }

        if (cart.items.length === 0) {
            return next(new AppError('Cart is empty', HTTP_STATUS.BAD_REQUEST));
        }

        // Get settings and validation
        const settings = await LoyaltySettings.getSettings();
        if (!settings.isActive) {
            return next(new AppError('Loyalty program is active', HTTP_STATUS.BAD_REQUEST));
        }

        if (pointsToRedeem < settings.minPointsToRedeem) {
            return next(new AppError(`Minimum redemption is ${settings.minPointsToRedeem} points`, HTTP_STATUS.BAD_REQUEST));
        }

        // Check user balance
        const loyalty = await LoyaltyPoint.findOne({ user: req.user._id });
        if (!loyalty || loyalty.points < pointsToRedeem) {
            return next(new AppError('Insufficient loyalty points', HTTP_STATUS.BAD_REQUEST));
        }

        // Calculate discount
        const discountAmount = pointsToRedeem / settings.pointsToMoneyRatio;

        if (settings.maxRedemptionPerOrder > 0 && discountAmount > settings.maxRedemptionPerOrder) {
            return next(new AppError(`Maximum discount allowed is $${settings.maxRedemptionPerOrder}`, HTTP_STATUS.BAD_REQUEST));
        }

        // Apply to cart (don't deduct yet)
        cart.pointsUsed = pointsToRedeem;
        cart.pointsDiscount = discountAmount;

        // Ensure total doesn't go below 0 (handled in calculateTotals)
        // If discount > subtotal, cap it
        if (cart.pointsDiscount > cart.subtotal) {
            const maxDiscount = cart.subtotal;
            const maxPoints = Math.ceil(maxDiscount * settings.pointsToMoneyRatio);

            cart.pointsDiscount = maxDiscount;
            cart.pointsUsed = maxPoints;
        }

        cart.calculateTotals();
        await cart.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Points applied to cart',
            data: { cart }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove redeemed points
 * @route   DELETE /api/cart/redeem-points
 * @access  Private
 */
const removePoints = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return next(new AppError('Cart not found', HTTP_STATUS.NOT_FOUND));
        }

        cart.pointsUsed = 0;
        cart.pointsDiscount = 0;
        cart.calculateTotals();
        await cart.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Points removed from cart',
            data: { cart }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyPromoCode,
    redeemPoints,
    removePoints
};
