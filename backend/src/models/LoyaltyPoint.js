const mongoose = require('mongoose');

const loyaltyPointSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        points: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        totalEarned: {
            type: Number,
            default: 0,
            min: 0
        },
        totalSpent: {
            type: Number,
            default: 0,
            min: 0
        },
        transactions: [{
            type: {
                type: String,
                enum: ['earned', 'spent', 'expired'],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            order: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order',
                default: null
            },
            expiresAt: {
                type: Date,
                default: null
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        tier: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum'],
            default: 'bronze'
        }
    },
    {
        timestamps: true
    }
);

// Indexes
loyaltyPointSchema.index({ user: 1 }, { unique: true });
loyaltyPointSchema.index({ points: -1 }); // For leaderboard

// Calculate tier based on total earned
loyaltyPointSchema.methods.updateTier = function () {
    if (this.totalEarned >= 10000) {
        this.tier = 'platinum';
    } else if (this.totalEarned >= 5000) {
        this.tier = 'gold';
    } else if (this.totalEarned >= 1000) {
        this.tier = 'silver';
    } else {
        this.tier = 'bronze';
    }
};

module.exports = mongoose.model('LoyaltyPoint', loyaltyPointSchema);
