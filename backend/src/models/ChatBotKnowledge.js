const mongoose = require('mongoose');

const chatBotKnowledgeSchema = new mongoose.Schema({
    trigger: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    response: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        default: 'general',
        trim: true
    }
}, {
    timestamps: true
});

// Add index for faster trigger matching
chatBotKnowledgeSchema.index({ trigger: 'text' });

module.exports = mongoose.model('ChatBotKnowledge', chatBotKnowledgeSchema);
