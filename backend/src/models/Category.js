const mongoose = require('mongoose');
const { formatImageUrl } = require('../utils/helpers');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            unique: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        image: {
            type: String,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                if (ret.image) {
                    ret.image = formatImageUrl(ret.image);
                }
                return ret;
            }
        },
        toObject: {
            transform: (doc, ret) => {
                if (ret.image) {
                    ret.image = formatImageUrl(ret.image);
                }
                return ret;
            }
        }
    }
);

// Indexes for faster queries
categorySchema.index({ isActive: 1 });

categorySchema.index({ createdAt: -1 }); // For sorting by creation date

module.exports = mongoose.model('Category', categorySchema);
