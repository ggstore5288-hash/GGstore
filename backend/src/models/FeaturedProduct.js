const mongoose = require('mongoose');
const { FEATURED_SECTIONS } = require('../utils/constants');

const featuredProductSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        section: {
            type: String,
            enum: Object.values(FEATURED_SECTIONS),
            required: [true, 'Section is required']
        },
        order: {
            type: Number,
            default: 0,
            min: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Ensure unique product per section
featuredProductSchema.index({ product: 1, section: 1 }, { unique: true });

// Index for faster queries
featuredProductSchema.index({ section: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('FeaturedProduct', featuredProductSchema);
