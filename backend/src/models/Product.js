const mongoose = require('mongoose');
const { PRODUCT_TYPES, PLATFORMS, REGIONS } = require('../utils/constants');
const { formatImageUrl } = require('../utils/helpers');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price cannot be negative']
        },
        discountPrice: {
            type: Number,
            min: [0, 'Discount price cannot be negative'],
            default: null,
            validate: {
                validator: function (value) {
                    return value === null || value < this.price;
                },
                message: 'Discount price must be less than regular price'
            }
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Product category is required']
        },
        type: {
            type: String,
            enum: Object.values(PRODUCT_TYPES),
            default: PRODUCT_TYPES.GAME
        },
        region: {
            type: String,
            enum: Object.values(REGIONS),
            default: REGIONS.GLOBAL
        },
        platform: {
            type: String,
            enum: Object.values(PLATFORMS),
            default: PLATFORMS.PC
        },
        stock: {
            type: Number,
            required: [true, 'Stock quantity is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0
        },

        images: {
            type: [String],
            default: []
        },
        bannerImages: {
            type: [String],
            default: []
        },
        isActive: {
            type: Boolean,
            default: true
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0,
            min: 0
        },
        viewCount: {
            type: Number,
            default: 0,
            min: 0
        },
        purchaseCount: {
            type: Number,
            default: 0,
            min: 0
        },
        isFlashSale: {
            type: Boolean,
            default: false
        },
        flashSaleEndsAt: {
            type: Date,
            default: null
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        tags: {
            type: [String],
            default: []
        },
        variants: [
            {
                type: {
                    type: String,
                    required: true // e.g., 'Primary PS5', 'Secondary PS4'
                },
                price: {
                    type: Number,
                    required: true
                },
                stock: {
                    type: Number,
                    default: 0
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

// Indexes for filtering and searching
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ type: 1, isActive: 1 });
productSchema.index({ platform: 1, isActive: 1 });
productSchema.index({ region: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ viewCount: -1 }); // For trending
productSchema.index({ purchaseCount: -1 }); // For popular
productSchema.index({ isFlashSale: 1, flashSaleEndsAt: 1 }); // For flash sales
productSchema.index({ isFeatured: 1 }); // For featured products
productSchema.index({ tags: 1 }); // For tag-based recommendations

// Virtual for effective price (considering discount)
productSchema.virtual('effectivePrice').get(function () {
    return this.discountPrice || this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.discountPrice && this.discountPrice < this.price) {
        return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
});

// Virtuals for price range
productSchema.virtual('priceRange').get(function () {
    if (!this.variants || this.variants.length === 0) {
        return null; // No variants, use standard price
    }

    // Calculate min and max from active variants (stock > 0 maybe? or all)
    // User wants to see range.
    const prices = this.variants.map(v => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) return `${min}`;
    return `${min} - ${max}`;
});

// Include virtuals in JSON
productSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        if (ret.images && Array.isArray(ret.images)) {
            ret.images = ret.images.map(img => formatImageUrl(img));
        }
        if (ret.bannerImages && Array.isArray(ret.bannerImages)) {
            ret.bannerImages = ret.bannerImages.map(img => formatImageUrl(img));
        }
        return ret;
    }
});
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
