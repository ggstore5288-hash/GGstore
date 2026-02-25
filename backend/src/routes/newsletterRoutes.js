const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Public routes
router.post('/subscribe', newsletterController.subscribe);

// Admin routes
router.get('/admin/subscribers', protect, requireAdmin, newsletterController.getSubscribers);
router.delete('/admin/subscribers/:id', protect, requireAdmin, newsletterController.deleteSubscriber);
router.post('/admin/send', protect, requireAdmin, newsletterController.sendBulkEmail);

module.exports = router;
