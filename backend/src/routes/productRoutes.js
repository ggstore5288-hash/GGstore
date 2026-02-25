const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProductByIdAdmin
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { uploadFields } = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');
const auditLog = require('../middleware/auditMiddleware');
const {
    createProductValidator,
    updateProductValidator,
    mongoIdValidator,
    paginationValidator
} = require('../utils/validators');

// Public routes
// @route   GET /api/products
router.get('/', paginationValidator, validate, getProducts);

// @route   GET /api/products/:id
router.get('/:id', mongoIdValidator, validate, getProductById);

// Admin routes (with audit logging)
// @route   POST /api/products
router.post(
    '/',
    protect,
    requireAdmin,
    auditLog,
    uploadFields([
        { name: 'images', maxCount: 5 },
        { name: 'bannerImages', maxCount: 3 }
    ]),
    require('../middleware/uploadMiddleware').processUploadedImages,
    createProductValidator,
    validate,
    createProduct
);

// @route   PUT /api/products/:id
router.put(
    '/:id',
    protect,
    requireAdmin,
    auditLog,
    uploadFields([
        { name: 'images', maxCount: 5 },
        { name: 'bannerImages', maxCount: 3 }
    ]),
    require('../middleware/uploadMiddleware').processUploadedImages,
    updateProductValidator,
    validate,
    updateProduct
);

// @route   DELETE /api/products/:id
router.delete('/:id', protect, requireAdmin, auditLog, mongoIdValidator, validate, deleteProduct);

// @route   PATCH /api/products/:id/toggle
router.patch('/:id/toggle', protect, requireAdmin, auditLog, mongoIdValidator, validate, toggleProductStatus);

// @route   GET /api/products/:id/admin (Admin detailed view)
router.get('/:id/admin', protect, requireAdmin, mongoIdValidator, validate, getProductByIdAdmin);

module.exports = router;
