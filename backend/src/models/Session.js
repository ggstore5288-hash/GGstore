const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        refreshToken: {
            type: String,
            required: true,
            unique: true
        },
        ipAddress: {
            type: String,
            required: true
        },
        userAgent: {
            type: String,
            default: null
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 } // Auto-delete expired sessions
        },
        isActive: {
            type: Boolean,
            default: true
        },
        lastActivity: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster queries
sessionSchema.index({ user: 1, isActive: 1 });

sessionSchema.index({ user: 1, expiresAt: 1 }); // Compound index

module.exports = mongoose.model('Session', sessionSchema);
