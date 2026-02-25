const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        products: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    {
        timestamps: true
    }
);

// Indexes

recentlyViewedSchema.index({ 'products.viewedAt': -1 });

module.exports = mongoose.model('RecentlyViewed', recentlyViewedSchema);
