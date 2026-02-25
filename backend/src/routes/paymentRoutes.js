const express = require('express');
const router = express.Router();
const {
    submitPayment,
    getPaymentStatus,
    getAllPayments,
    confirmPayment,
    rejectPayment
} = require('../controllers/paymentController');
const { protect, requireEmailVerification } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimitMiddleware');
const validate = require('../middleware/validateMiddleware');
const auditLog = require('../middleware/auditMiddleware');
const {
    submitPaymentValidator,
    mongoIdValidator,
    paginationValidator
} = require('../utils/validators');

// Admin routes (must come before parameterized routes)
// @route   GET /api/payments
router.get('/', protect, requireAdmin, paginationValidator, validate, getAllPayments);

// @route   PATCH /api/payments/:id/confirm
router.patch('/:id/confirm', protect, requireAdmin, auditLog, mongoIdValidator, validate, confirmPayment);

// @route   PATCH /api/payments/:id/reject
router.patch('/:id/reject', protect, requireAdmin, auditLog, mongoIdValidator, validate, rejectPayment);

// User routes
// @route   POST /api/payments
router.post(
    '/',
    protect,
    requireEmailVerification,
    uploadLimiter,
    uploadSingle('proofImage'),
    require('../middleware/uploadMiddleware').processUploadedImages,
    submitPaymentValidator,
    validate,
    submitPayment
);

// @route   GET /api/payments/:orderId
router.get('/:orderId', protect, requireEmailVerification, mongoIdValidator, validate, getPaymentStatus);

module.exports = router;
