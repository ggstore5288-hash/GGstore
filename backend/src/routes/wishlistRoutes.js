const express = require('express');
const router = express.Router();
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { body } = require('express-validator');

// All routes require authentication
router.use(protect);

// @route   GET /api/wishlist
router.get('/', getWishlist);

// @route   POST /api/wishlist
router.post(
    '/',
    [
        body('productId').isMongoId().withMessage('Valid product ID is required')
    ],
    validate,
    addToWishlist
);

// @route   DELETE /api/wishlist/:productId
// Note: No param validator — Mongoose handles invalid IDs safely
router.delete('/:productId', removeFromWishlist);

// @route   GET /api/wishlist/check/:productId
router.get('/check/:productId', checkWishlist);

module.exports = router;
