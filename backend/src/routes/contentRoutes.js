const express = require('express');
const router = express.Router();
const {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,
    getFeaturedProducts,
    addFeaturedProduct,
    updateFeaturedProduct,
    removeFeaturedProduct,
    reorderFeatured
} = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');
const auditLog = require('../middleware/auditMiddleware');
const { mongoIdValidator } = require('../utils/validators');

// ========== BANNER ROUTES ==========

// Public routes
// @route   GET /api/content/banners
router.get('/banners', getBanners);

// Admin routes
// @route   POST /api/content/banners
router.post('/banners', protect, requireAdmin, auditLog, uploadSingle('bannerImage'), require('../middleware/uploadMiddleware').processUploadedImages, createBanner);

// @route   PUT /api/content/banners/:id
router.put('/banners/:id', protect, requireAdmin, auditLog, uploadSingle('bannerImage'), require('../middleware/uploadMiddleware').processUploadedImages, mongoIdValidator, validate, updateBanner);

// @route   DELETE /api/content/banners/:id
router.delete('/banners/:id', protect, requireAdmin, auditLog, mongoIdValidator, validate, deleteBanner);

// @route   POST /api/content/banners/reorder
router.post('/banners/reorder', protect, requireAdmin, auditLog, reorderBanners);

// ========== FEATURED PRODUCT ROUTES ==========

// Public routes
// @route   GET /api/content/featured
router.get('/featured', getFeaturedProducts);

// Admin routes
// @route   POST /api/content/featured
router.post('/featured', protect, requireAdmin, auditLog, addFeaturedProduct);

// @route   PUT /api/content/featured/:id
router.put('/featured/:id', protect, requireAdmin, auditLog, mongoIdValidator, validate, updateFeaturedProduct);

// @route   DELETE /api/content/featured/:id
router.delete('/featured/:id', protect, requireAdmin, auditLog, mongoIdValidator, validate, removeFeaturedProduct);

// @route   POST /api/content/featured/reorder
router.post('/featured/reorder', protect, requireAdmin, auditLog, reorderFeatured);

module.exports = router;
