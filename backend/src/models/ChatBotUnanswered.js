const mongoose = require('mongoose');

const chatBotUnansweredSchema = new mongoose.Schema({
    query: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    count: {
        type: Number,
        default: 1
    },
    lastAsked: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ChatBotUnanswered', chatBotUnansweredSchema);
