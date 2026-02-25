const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../utils/constants');
const { generateOrderNumber } = require('../utils/helpers');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    variant: {
        type: { type: String },
        price: Number
    }
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        orderNumber: {
            type: String,
            unique: true,
            required: true
        },
        items: [orderItemSchema],
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        discount: {
            type: Number,
            default: 0,
            min: 0
        },
        total: {
            type: Number,
            required: true,
            min: 0
        },
        customerInfo: {
            name: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            }
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PAYMENT_METHODS),
            required: true
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING
        },
        orderStatus: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.NEW
        },
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            default: null
        },
        promoCode: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PromoCode',
            default: null
        },
        pointsUsed: {
            type: Number,
            default: 0
        },
        pointsDiscount: {
            type: Number,
            default: 0
        },
        trackingHistory: [{
            status: {
                type: String,
                enum: Object.values(ORDER_STATUS),
                required: true
            },
            message: {
                type: String,
                default: null
            },
            updatedAt: {
                type: Date,
                default: Date.now
            },
            updatedBy: {
                type: String,
                enum: ['system', 'admin', 'user'],
                default: 'system'
            }
        }],
        estimatedDelivery: {
            type: Date,
            default: null
        },
        deliveredAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Generate order number before saving
orderSchema.pre('save', function (next) {
    if (!this.orderNumber) {
        this.orderNumber = generateOrderNumber();
    }

    // Track status changes
    if (this.isModified('orderStatus') && !this.isNew) {
        const statusMessages = {
            [ORDER_STATUS.NEW]: 'Order placed successfully',
            [ORDER_STATUS.PROCESSING]: 'Order is being processed',
            [ORDER_STATUS.COMPLETED]: 'Order completed and delivered',
            [ORDER_STATUS.CANCELLED]: 'Order has been cancelled'
        };

        this.trackingHistory.push({
            status: this.orderStatus,
            message: statusMessages[this.orderStatus] || 'Order status updated',
            updatedAt: new Date(),
            updatedBy: 'system'
        });

        // Set deliveredAt when completed
        if (this.orderStatus === ORDER_STATUS.COMPLETED && !this.deliveredAt) {
            this.deliveredAt = new Date();
        }
    }

    next();
});

// Indexes for faster queries
orderSchema.index({ user: 1, createdAt: -1 });

orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1 }); // Compound index for admin queries
orderSchema.index({ user: 1, orderStatus: 1 }); // For user order filtering
orderSchema.index({ createdAt: -1 }); // For sorting by date

module.exports = mongoose.model('Order', orderSchema);
