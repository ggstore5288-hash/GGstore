const express = require('express');
const router = express.Router();
const {
    createPriceAlert,
    getPriceAlerts,
    deletePriceAlert,
    checkPriceDrops
} = require('../controllers/priceAlertController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const auditLog = require('../middleware/auditMiddleware');
const { mongoIdValidator } = require('../utils/validators');
const { body } = require('express-validator');

// All routes require authentication
router.use(protect);

// @route   POST /api/price-alerts
router.post(
    '/',
    [
        body('productId').isMongoId().withMessage('Valid product ID is required'),
        body('targetPrice').isFloat({ min: 0 }).withMessage('Target price must be a positive number')
    ],
    validate,
    createPriceAlert
);

// @route   GET /api/price-alerts
router.get('/', getPriceAlerts);

// @route   DELETE /api/price-alerts/:id
router.delete('/:id', mongoIdValidator, validate, deletePriceAlert);

// @route   POST /api/price-alerts/check (Admin only)
router.post('/check', requireAdmin, auditLog, checkPriceDrops);

module.exports = router;
