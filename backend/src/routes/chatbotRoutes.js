const express = require('express');
const router = express.Router();
const chatBotController = require('../controllers/chatbotController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// Public route for querying the chatbot
router.post('/query', chatBotController.handleQuery);

// Admin routes
router.get('/admin/knowledge', protect, requireAdmin, chatBotController.getKnowledgeBase);
router.post('/admin/knowledge', protect, requireAdmin, chatBotController.upsertKnowledge);
router.delete('/admin/knowledge/:id', protect, requireAdmin, chatBotController.deleteKnowledge);

router.get('/admin/unanswered', protect, requireAdmin, chatBotController.getUnanswered);
router.delete('/admin/unanswered/:id', protect, requireAdmin, chatBotController.deleteUnanswered);

module.exports = router;
