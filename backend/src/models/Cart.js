const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    variant: {
        type: { type: String },
        price: Number
    }
});

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        items: [cartItemSchema],
        subtotal: {
            type: Number,
            default: 0,
            min: [0, 'Subtotal cannot be negative']
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative']
        },
        total: {
            type: Number,
            default: 0,
            min: [0, 'Total cannot be negative']
        },
        promoCode: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PromoCode',
            default: null
        },
        pointsUsed: {
            type: Number,
            default: 0,
            min: 0
        },
        pointsDiscount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

// Calculate totals before saving
cartSchema.methods.calculateTotals = function () {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Calculate total (subtotal - discount - pointsDiscount)
    this.total = Math.max(0, this.subtotal - this.discount - this.pointsDiscount);

    return this;
};

// Indexes for faster queries

cartSchema.index({ updatedAt: -1 }); // For sorting by last update

module.exports = mongoose.model('Cart', cartSchema);
