const ChatBotKnowledge = require('../models/ChatBotKnowledge');
const ChatBotUnanswered = require('../models/ChatBotUnanswered');
const Settings = require('../models/Settings');

/**
 * @desc Get response for a user query
 * @route POST /api/chatbot/query
 */
exports.handleQuery = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: 'Query is required' });

        const normalizedQuery = query.trim().toLowerCase();

        // 1. Try to find an exact or regex match in Knowledge Base
        // We'll use a simple find for now, but text search or regex could be better
        let match = await ChatBotKnowledge.findOne({
            trigger: { $regex: new RegExp(normalizedQuery, 'i') }
        });

        if (match) {
            return res.json({ response: match.response });
        }

        // 2. If no match, log to Unanswered
        const unanswered = await ChatBotUnanswered.findOneAndUpdate(
            { query: normalizedQuery },
            {
                $inc: { count: 1 },
                $set: { lastAsked: new Date() }
            },
            { upsert: true, new: true }
        );

        // 3. Get default answer from Settings
        let defaultAnswerSetting = await Settings.findOne({ key: 'chatbot_default_answer' });
        const defaultAnswer = defaultAnswerSetting ? defaultAnswerSetting.value : "I'm sorry, I don't have an answer for that yet. I've notified our team to train me on this!";

        res.json({ response: defaultAnswer, isDefault: true });
    } catch (error) {
        console.error('ChatBot Query Error:', error);
        res.status(500).json({ message: 'Error processing chat query' });
    }
};

/**
 * @desc Get all knowledge items (Admin)
 */
exports.getKnowledgeBase = async (req, res) => {
    try {
        const kb = await ChatBotKnowledge.find().sort({ createdAt: -1 });
        res.json(kb);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching knowledge base' });
    }
};

/**
 * @desc Add/Update knowledge item (Admin)
 */
exports.upsertKnowledge = async (req, res) => {
    try {
        const { trigger, response, category } = req.body;
        const normalizedTrigger = trigger.trim().toLowerCase();

        const kb = await ChatBotKnowledge.findOneAndUpdate(
            { trigger: normalizedTrigger },
            { response, category },
            { upsert: true, new: true }
        );

        // If this trigger was in unanswered, remove it
        await ChatBotUnanswered.deleteOne({ query: normalizedTrigger });

        res.json(kb);
    } catch (error) {
        res.status(500).json({ message: 'Error saving knowledge item' });
    }
};

/**
 * @desc Delete knowledge item (Admin)
 */
exports.deleteKnowledge = async (req, res) => {
    try {
        await ChatBotKnowledge.findByIdAndDelete(req.params.id);
        res.json({ message: 'Knowledge item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting knowledge item' });
    }
};

/**
 * @desc Get unanswered questions (Admin)
 */
exports.getUnanswered = async (req, res) => {
    try {
        const unanswered = await ChatBotUnanswered.find().sort({ count: -1 });
        res.json(unanswered);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unanswered questions' });
    }
};

/**
 * @desc Delete unanswered question (Admin)
 */
exports.deleteUnanswered = async (req, res) => {
    try {
        await ChatBotUnanswered.findByIdAndDelete(req.params.id);
        res.json({ message: 'Unanswered question removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing unanswered question' });
    }
};
