const express = require('express');
const router = express.Router();
const {
    trackProductView,
    getRecentlyViewed,
    clearRecentlyViewed
} = require('../controllers/recentlyViewedController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { body } = require('express-validator');

// All routes require authentication
router.use(protect);

// @route   POST /api/recently-viewed
router.post(
    '/',
    [
        body('productId').isMongoId().withMessage('Valid product ID is required')
    ],
    validate,
    trackProductView
);

// @route   GET /api/recently-viewed
router.get('/', getRecentlyViewed);

// @route   DELETE /api/recently-viewed
router.delete('/', clearRecentlyViewed);

module.exports = router;
