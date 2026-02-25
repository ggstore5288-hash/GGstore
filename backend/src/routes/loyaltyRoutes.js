const express = require('express');
const router = express.Router();
const {
    getLoyaltyPoints,
    getLeaderboard,
    getLoyaltySettings,
    updateLoyaltySettings,
    redeemPointsHandler,
    adjustPoints,
    getAllLoyalty
} = require('../controllers/loyaltyController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const auditLog = require('../middleware/auditMiddleware');
const { paginationValidator } = require('../utils/validators');

// Public routes
// @route   GET /api/loyalty/leaderboard
router.get('/leaderboard', paginationValidator, validate, getLeaderboard);

// User routes (Private)
// @route   GET /api/loyalty
router.get('/', protect, getLoyaltyPoints);

// @route   POST /api/loyalty/redeem
router.post('/redeem', protect, redeemPointsHandler);


// Admin routes (Private + Admin)
// @route   GET /api/loyalty/settings
router.get('/settings', protect, requireAdmin, getLoyaltySettings);

// @route   PUT /api/loyalty/settings
router.put('/settings', protect, requireAdmin, auditLog, updateLoyaltySettings);

// @route   POST /api/loyalty/adjust
router.post('/adjust', protect, requireAdmin, auditLog, adjustPoints);

// @route   GET /api/loyalty/all
router.get('/all', protect, requireAdmin, paginationValidator, validate, getAllLoyalty);

module.exports = router;
