const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        type: {
            type: String,
            enum: ['string', 'number', 'boolean', 'object', 'array'],
            default: 'string'
        },
        category: {
            type: String,
            default: 'general',
            trim: true
        },
        description: {
            type: String,
            default: null
        },
        isPublic: {
            type: Boolean,
            default: false // If true, can be accessed without auth
        }
    },
    {
        timestamps: true
    }
);

// Indexes

settingsSchema.index({ category: 1 });

module.exports = mongoose.model('Settings', settingsSchema);
