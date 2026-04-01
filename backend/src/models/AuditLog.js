const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        action: {
            type: String,
            required: true,
            trim: true
        },
        resource: {
            type: String,
            required: true,
            trim: true
        },
        resourceId: {
            type: String,
            default: null
        },
        method: {
            type: String,
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            default: null
        },
        endpoint: {
            type: String,
            default: null
        },
        ipAddress: {
            type: String,
            required: true
        },
        userAgent: {
            type: String,
            default: null
        },
        changes: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        status: {
            type: String,
            enum: ['success', 'failure'],
            default: 'success'
        },
        errorMessage: {
            type: String,
            default: null
        },
        location: {
            city: String,
            country: String,
            countryCode: String,
            lat: Number,
            lon: Number,
            timezone: String,
            isp: String
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster queries
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-prune after 30 days
auditLogSchema.index({ user: 1, resource: 1, createdAt: -1 }); // Compound index

module.exports = mongoose.model('AuditLog', auditLogSchema);
