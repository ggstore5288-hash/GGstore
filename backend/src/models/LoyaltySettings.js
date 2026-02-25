const mongoose = require('mongoose');

const loyaltySettingsSchema = new mongoose.Schema(
    {
        // Points earning rules
        pointsPerDollar: {
            type: Number,
            default: 10,
            min: 0,
            required: true
        },

        // Points redemption rules
        pointsToMoneyRatio: {
            type: Number,
            default: 100, // 100 points = 1 EGP
            min: 1,
            required: true
        },
        minPointsToRedeem: {
            type: Number,
            default: 100,
            min: 0,
            required: true
        },
        maxRedemptionPerOrder: {
            type: Number,
            default: 1000, // Max 10 EGP discount per order
            min: 0
        },

        // Points expiry
        pointsExpiryDays: {
            type: Number,
            default: 365,
            min: 0
        },

        // Tier thresholds
        tierThresholds: {
            bronze: { type: Number, default: 0 },
            silver: { type: Number, default: 1000 },
            gold: { type: Number, default: 5000 },
            platinum: { type: Number, default: 10000 }
        },

        // Tier benefits (multipliers)
        tierMultipliers: {
            bronze: { type: Number, default: 1 },
            silver: { type: Number, default: 1.25 },
            gold: { type: Number, default: 1.5 },
            platinum: { type: Number, default: 2 }
        },

        // Bonus points for actions
        bonusPoints: {
            firstPurchase: { type: Number, default: 100 },
            review: { type: Number, default: 50 },
            referral: { type: Number, default: 200 }
        },

        // Program status
        isActive: {
            type: Boolean,
            default: true
        },

        // Last updated by
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Singleton pattern - only one settings document
loyaltySettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('LoyaltySettings', loyaltySettingsSchema);
