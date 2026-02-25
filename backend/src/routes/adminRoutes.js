const express = require('express');
const router = express.Router();
const {
    getAdminStats,
    getAllPriceAlerts,
    getAllLoyaltyPoints,
    adjustLoyaltyPoints,
    getAllReviews,
    moderateReview,
    bulkUpdateProducts,
    bulkDeleteProducts,
    getSettings,
    updateSetting,
    getAnalytics,
    getAllWishlists,
    getAllRecentlyViewed
} = require('../controllers/adminController');
const { getCategoryStats, bulkUpdateCategories } = require('../controllers/adminCategoryController');
const { getPromoCodeStats } = require('../controllers/adminPromoCodeController');
const {
    getAllBannersAdmin,
    getAllFeaturedAdmin,
    reorderBanners,
    reorderFeatured
} = require('../controllers/adminContentController');
const {
    getEmailQueue,
    retryEmails,
    deleteEmailFromQueue
} = require('../controllers/adminEmailController');
const {
    getPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
} = require('../controllers/adminPaymentMethodController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const auditLog = require('../middleware/auditMiddleware');
const validate = require('../middleware/validateMiddleware');
const { mongoIdValidator, paginationValidator } = require('../utils/validators');
const { body } = require('express-validator');

// All routes require admin access
router.use(protect, requireAdmin);

// @route   GET /api/admin/stats
router.get('/stats', getAdminStats);

// @route   GET /api/admin/analytics
router.get('/analytics', getAnalytics);

// @route   GET /api/admin/price-alerts
router.get('/price-alerts', paginationValidator, validate, getAllPriceAlerts);

// @route   GET /api/admin/loyalty
router.get('/loyalty', paginationValidator, validate, getAllLoyaltyPoints);

// @route   PATCH /api/admin/loyalty/:userId
router.patch(
    '/loyalty/:userId',
    auditLog,
    mongoIdValidator,
    [
        body('points').isNumeric().withMessage('Points must be a number'),
        body('reason').optional().trim().isLength({ max: 200 }).withMessage('Reason must be less than 200 characters')
    ],
    validate,
    adjustLoyaltyPoints
);

// @route   GET /api/admin/reviews
router.get('/reviews', paginationValidator, validate, getAllReviews);

// @route   PATCH /api/admin/reviews/:id
router.patch(
    '/reviews/:id',
    auditLog,
    mongoIdValidator,
    [
        body('isApproved').isBoolean().withMessage('isApproved must be a boolean')
    ],
    validate,
    moderateReview
);

// @route   POST /api/admin/products/bulk
router.post(
    '/products/bulk',
    auditLog,
    [
        body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required'),
        body('productIds.*').isMongoId().withMessage('All product IDs must be valid'),
        body('updates').isObject().withMessage('Updates object is required')
    ],
    validate,
    bulkUpdateProducts
);

// @route   DELETE /api/admin/products/bulk
router.delete(
    '/products/bulk',
    auditLog,
    [
        body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required'),
        body('productIds.*').isMongoId().withMessage('All product IDs must be valid')
    ],
    validate,
    bulkDeleteProducts
);

// @route   GET /api/admin/settings
router.get('/settings', getSettings);

// @route   PUT /api/admin/settings/:key
router.put(
    '/settings/:key',
    auditLog,
    [
        body('value').notEmpty().withMessage('Value is required'),
        body('description').optional().trim(),
        body('isPublic').optional().isBoolean()
    ],
    validate,
    updateSetting
);

// @route   GET /api/admin/wishlists
router.get('/wishlists', paginationValidator, validate, getAllWishlists);

// @route   GET /api/admin/recently-viewed
router.get('/recently-viewed', paginationValidator, validate, getAllRecentlyViewed);

// @route   GET /api/admin/categories/stats
router.get('/categories/stats', getCategoryStats);

// @route   POST /api/admin/categories/bulk
router.post(
    '/categories/bulk',
    auditLog,
    [
        body('categoryIds').isArray({ min: 1 }).withMessage('Category IDs array is required'),
        body('categoryIds.*').isMongoId().withMessage('All category IDs must be valid'),
        body('updates').isObject().withMessage('Updates object is required')
    ],
    validate,
    bulkUpdateCategories
);

// @route   GET /api/admin/promo-codes/stats/:id?
router.get('/promo-codes/stats/:id?', getPromoCodeStats);

// @route   GET /api/admin/content/banners
router.get('/content/banners', getAllBannersAdmin);

// @route   GET /api/admin/content/featured
router.get('/content/featured', getAllFeaturedAdmin);

// @route   PATCH /api/admin/content/banners/reorder
router.patch(
    '/content/banners/reorder',
    auditLog,
    [
        body('bannerOrders').isArray().withMessage('bannerOrders must be an array'),
        body('bannerOrders.*.bannerId').isMongoId().withMessage('Valid banner ID required'),
        body('bannerOrders.*.order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
    ],
    validate,
    reorderBanners
);

// @route   PATCH /api/admin/content/featured/reorder
router.patch(
    '/content/featured/reorder',
    auditLog,
    [
        body('featuredOrders').isArray().withMessage('featuredOrders must be an array'),
        body('featuredOrders.*.featuredId').isMongoId().withMessage('Valid featured ID required'),
        body('featuredOrders.*.order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
    ],
    validate,
    reorderFeatured
);

// @route   GET /api/admin/emails
router.get('/emails', paginationValidator, validate, getEmailQueue);

// @route   POST /api/admin/emails/retry
router.post('/emails/retry', auditLog, retryEmails);

// @route   DELETE /api/admin/emails/:id
router.delete('/emails/:id', auditLog, mongoIdValidator, validate, deleteEmailFromQueue);

// Payment Method Management
router.get('/payment-methods', getPaymentMethods);
router.post('/payment-methods', auditLog, createPaymentMethod);
router.put('/payment-methods/:id', auditLog, updatePaymentMethod);
router.delete('/payment-methods/:id', auditLog, deletePaymentMethod);

module.exports = router;
