const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderTracking
} = require('../controllers/orderController');
const { getOrderStats, updateEstimatedDelivery } = require('../controllers/adminOrderController');
const { protect, requireEmailVerification } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const auditLog = require('../middleware/auditMiddleware');
const {
    createOrderValidator,
    updateOrderStatusValidator,
    mongoIdValidator,
    paginationValidator
} = require('../utils/validators');

// User routes (require email verification)
// @route   POST /api/orders
router.post('/', protect, requireEmailVerification, createOrderValidator, validate, createOrder);

// @route   GET /api/orders
router.get('/', protect, requireEmailVerification, paginationValidator, validate, getOrders);

// @route   GET /api/orders/:id
router.get('/:id', protect, requireEmailVerification, mongoIdValidator, validate, getOrderById);

// @route   GET /api/orders/:id/tracking
router.get('/:id/tracking', protect, requireEmailVerification, mongoIdValidator, validate, getOrderTracking);

// @route   PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', protect, requireEmailVerification, mongoIdValidator, validate, cancelOrder);

// Admin routes
// @route   GET /api/orders/admin/all
router.get('/admin/all', protect, requireAdmin, paginationValidator, validate, getAllOrders);

// @route   GET /api/orders/admin/stats
router.get('/admin/stats', protect, requireAdmin, getOrderStats);

// @route   PATCH /api/orders/:id/status
router.patch('/:id/status', protect, requireAdmin, auditLog, updateOrderStatusValidator, validate, updateOrderStatus);

// @route   PATCH /api/orders/:id/delivery
router.patch(
    '/:id/delivery',
    protect,
    requireAdmin,
    auditLog,
    mongoIdValidator,
    [
        body('estimatedDelivery').isISO8601().withMessage('Valid delivery date is required')
    ],
    validate,
    updateEstimatedDelivery
);

module.exports = router;
