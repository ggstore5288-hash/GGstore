const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        targetPrice: {
            type: Number,
            required: true,
            min: 0
        },
        currentPrice: {
            type: Number,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        notified: {
            type: Boolean,
            default: false
        },
        notifiedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Ensure one alert per user per product
priceAlertSchema.index({ user: 1, product: 1 }, { unique: true });
priceAlertSchema.index({ isActive: 1, notified: 1 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
