const mongoose = require('mongoose');
const { PAYMENT_METHODS, PAYMENT_STATUS } = require('../utils/constants');

const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        method: {
            type: String,
            enum: Object.values(PAYMENT_METHODS),
            required: [true, 'Payment method is required']
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true
        },
        proofImage: {
            type: String,
            required: [true, 'Payment proof image is required']
        },
        status: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING
        },
        confirmedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        confirmedAt: {
            type: Date,
            default: null
        },
        rejectionReason: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster queries
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ user: 1, status: 1 }); // Compound index for user payment queries
paymentSchema.index({ status: 1, createdAt: -1 }); // For admin payment queries
paymentSchema.index({ createdAt: -1 }); // For sorting by date

module.exports = mongoose.model('Payment', paymentSchema);
