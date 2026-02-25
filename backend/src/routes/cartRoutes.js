const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyPromoCode,
    redeemPoints,
    removePoints
} = require('../controllers/cartController');
const { protect, requireEmailVerification } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
    addToCartValidator,
    updateCartValidator,
    cartItemIdValidator,
    mongoIdValidator
} = require('../utils/validators');

// All cart routes require authentication and email verification
router.use(protect, requireEmailVerification);

// @route   GET /api/cart
router.get('/', getCart);

// @route   POST /api/cart
router.post('/', addToCartValidator, validate, addToCart);

// @route   PUT /api/cart/:itemId
router.put('/:itemId', updateCartValidator, validate, updateCartItem);

// @route   DELETE /api/cart/:itemId
router.delete('/:itemId', cartItemIdValidator, validate, removeFromCart);

// @route   DELETE /api/cart
router.delete('/', clearCart);

// @route   POST /api/cart/promo-code
router.post('/promo-code', applyPromoCode);

// @route   POST /api/cart/redeem-points
router.post('/redeem-points', validate, redeemPoints);

// @route   DELETE /api/cart/redeem-points
router.delete('/redeem-points', removePoints);

module.exports = router;
