const mongoose = require('mongoose');
const { DISCOUNT_TYPES } = require('../utils/constants');
const { isExpired } = require('../utils/helpers');

const promoCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Promo code is required'],
            unique: true,
            uppercase: true,
            trim: true
        },
        discountType: {
            type: String,
            enum: Object.values(DISCOUNT_TYPES),
            required: [true, 'Discount type is required']
        },
        discountValue: {
            type: Number,
            required: [true, 'Discount value is required'],
            min: [0, 'Discount value cannot be negative']
        },
        expirationDate: {
            type: Date,
            required: [true, 'Expiration date is required']
        },
        usageLimit: {
            type: Number,
            default: null, // null means unlimited
            min: [1, 'Usage limit must be at least 1']
        },
        usedCount: {
            type: Number,
            default: 0,
            min: [0, 'Used count cannot be negative']
        },
        isActive: {
            type: Boolean,
            default: true
        },
        minPurchaseAmount: {
            type: Number,
            default: 0,
            min: [0, 'Minimum purchase amount cannot be negative']
        }
    },
    {
        timestamps: true
    }
);

// Method to check if promo code is valid
promoCodeSchema.methods.isValid = function () {
    // Check if active
    if (!this.isActive) {
        return { valid: false, message: 'Promo code is inactive' };
    }

    // Check if expired
    if (isExpired(this.expirationDate)) {
        return { valid: false, message: 'Promo code has expired' };
    }

    // Check usage limit
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
        return { valid: false, message: 'Promo code usage limit reached' };
    }

    return { valid: true };
};

// Method to calculate discount
promoCodeSchema.methods.calculateDiscount = function (amount) {
    if (this.discountType === DISCOUNT_TYPES.PERCENTAGE) {
        return (amount * this.discountValue) / 100;
    } else {
        return Math.min(this.discountValue, amount); // Don't exceed total amount
    }
};

// Index for faster lookups

promoCodeSchema.index({ isActive: 1, expirationDate: 1 });

module.exports = mongoose.model('PromoCode', promoCodeSchema);
