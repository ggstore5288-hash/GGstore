const { DISCOUNT_TYPES } = require('../utils/constants');

/**
 * Calculate cart subtotal
 * @param {array} items - Cart items
 * @returns {number} - Subtotal
 */
const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

/**
 * Apply promo code discount
 * @param {number} subtotal - Cart subtotal
 * @param {object} promoCode - PromoCode object
 * @returns {object} - { discount, total }
 */
const applyPromoCode = (subtotal, promoCode) => {
    if (!promoCode) {
        return { discount: 0, total: subtotal };
    }

    // Check minimum purchase amount
    if (subtotal < promoCode.minPurchaseAmount) {
        throw new Error(`Minimum purchase amount of ${promoCode.minPurchaseAmount} required`);
    }

    const discount = promoCode.calculateDiscount(subtotal);
    const total = Math.max(0, subtotal - discount);

    return { discount, total };
};

/**
 * Calculate order totals
 * @param {array} items - Order items
 * @param {object} promoCode - PromoCode object (optional)
 * @returns {object} - { subtotal, discount, total }
 */
const calculateOrderTotals = (items, promoCode = null) => {
    const subtotal = calculateSubtotal(items);
    const { discount, total } = applyPromoCode(subtotal, promoCode);

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        total: Math.round(total * 100) / 100
    };
};

/**
 * Validate cart items stock
 * @param {array} cartItems - Cart items with product references
 * @returns {object} - { valid, errors }
 */
const validateStock = (cartItems) => {
    const errors = [];

    for (const item of cartItems) {
        if (!item.product.isActive) {
            errors.push(`${item.product.name} is no longer available`);
        } else if (item.product.stock < item.quantity) {
            errors.push(`${item.product.name} has only ${item.product.stock} items in stock`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    calculateSubtotal,
    applyPromoCode,
    calculateOrderTotals,
    validateStock
};
