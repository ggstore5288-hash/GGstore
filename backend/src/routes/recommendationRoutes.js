const express = require('express');
const router = express.Router();
const {
    getRecommendations,
    getProductRecommendations,
    getTrendingProducts,
    getPopularProducts
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { mongoIdValidator, paginationValidator } = require('../utils/validators');

// @route   GET /api/recommendations/trending
router.get('/trending', paginationValidator, validate, getTrendingProducts);

// @route   GET /api/recommendations/popular
router.get('/popular', paginationValidator, validate, getPopularProducts);

// @route   GET /api/recommendations/product/:productId
router.get('/product/:productId', mongoIdValidator, validate, getProductRecommendations);

// @route   GET /api/recommendations (personalized - requires auth)
router.get('/', protect, paginationValidator, validate, getRecommendations);

module.exports = router;
