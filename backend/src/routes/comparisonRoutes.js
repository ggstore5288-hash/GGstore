const express = require('express');
const router = express.Router();
const { compareProducts } = require('../controllers/comparisonController');
const validate = require('../middleware/validateMiddleware');
const { body } = require('express-validator');

// @route   POST /api/compare
router.post(
    '/',
    [
        body('productIds')
            .isArray({ min: 2, max: 4 })
            .withMessage('Provide 2-4 product IDs to compare'),
        body('productIds.*').isMongoId().withMessage('All product IDs must be valid')
    ],
    validate,
    compareProducts
);

module.exports = router;
