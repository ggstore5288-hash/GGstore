const express = require('express');
const router = express.Router();
const {
    getAdminProducts,
    toggleFeatured,
    updateProductTags,
    getProductStats
} = require('../controllers/adminProductController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const auditLog = require('../middleware/auditMiddleware');
const { mongoIdValidator, paginationValidator } = require('../utils/validators');
const { body } = require('express-validator');

// All routes require admin access
router.use(protect, requireAdmin);

// @route   GET /api/admin/products
router.get('/', paginationValidator, validate, getAdminProducts);

// @route   GET /api/admin/products/stats
router.get('/stats', getProductStats);

// @route   PATCH /api/admin/products/:id/feature
router.patch('/:id/feature', auditLog, mongoIdValidator, validate, toggleFeatured);

// @route   PATCH /api/admin/products/:id/tags
router.patch(
    '/:id/tags',
    auditLog,
    mongoIdValidator,
    [
        body('tags').isArray().withMessage('Tags must be an array'),
        body('tags.*').isString().trim().notEmpty()
    ],
    validate,
    updateProductTags
);

module.exports = router;
