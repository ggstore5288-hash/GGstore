const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        title: {
            type: String,
            trim: true,
            maxlength: 100
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 1000
        },
        isVerified: {
            type: Boolean,
            default: false // Verified if user purchased the product
        },
        isApproved: {
            type: Boolean,
            default: true // Admin can moderate reviews
        },
        showInSlider: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Indexes for faster queries
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

module.exports = mongoose.model('Review', reviewSchema);
