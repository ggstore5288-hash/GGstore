const express = require('express');
const router = express.Router();
const {
    getFlashSales,
    createFlashSale,
    endFlashSale
} = require('../controllers/flashSaleController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const auditLog = require('../middleware/auditMiddleware');
const { mongoIdValidator } = require('../utils/validators');
const { body, param } = require('express-validator');

// @route   GET /api/flash-sales
router.get('/', getFlashSales);

// Admin routes
router.use(protect, requireAdmin);

// @route   POST /api/flash-sales
router.post(
    '/',
    [
        body('productId').isMongoId().withMessage('Valid product ID is required'),
        body('discountPrice').isFloat({ min: 0 }).withMessage('Discount price must be positive'),
        body('endsAt').isISO8601().withMessage('Valid end date is required')
    ],
    validate,
    auditLog,
    createFlashSale
);

// @route   DELETE /api/flash-sales/:id
router.delete('/:id', auditLog, mongoIdValidator, validate, endFlashSale);

module.exports = router;
