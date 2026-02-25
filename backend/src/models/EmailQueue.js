const mongoose = require('mongoose');

const emailQueueSchema = new mongoose.Schema(
    {
        to: {
            type: String,
            required: true,
            trim: true
        },
        subject: {
            type: String,
            required: true,
            trim: true
        },
        html: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'sending', 'sent', 'failed'],
            default: 'pending'
        },
        attempts: {
            type: Number,
            default: 0,
            min: 0
        },
        maxAttempts: {
            type: Number,
            default: 3,
            min: 1
        },
        lastAttemptAt: {
            type: Date,
            default: null
        },
        sentAt: {
            type: Date,
            default: null
        },
        errorMessage: {
            type: String,
            default: null
        },
        emailType: {
            type: String,
            enum: ['verification', 'password_reset', 'order_confirmation', 'payment_confirmation', 'other'],
            default: 'other'
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster queries
emailQueueSchema.index({ status: 1, createdAt: 1 }); // For processing queue
emailQueueSchema.index({ to: 1, createdAt: -1 }); // For user email history
emailQueueSchema.index({ status: 1, attempts: 1 }); // For retry logic

module.exports = mongoose.model('EmailQueue', emailQueueSchema);
