const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    updateUserRole,
    getUserById,
    updateUser,
    deleteUser,
    bulkUpdateUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { userApiLimiter, adminLimiter } = require('../middleware/rateLimitMiddleware');
const validate = require('../middleware/validateMiddleware');
const auditLog = require('../middleware/auditMiddleware');
const { mongoIdValidator, paginationValidator } = require('../utils/validators');
const { body } = require('express-validator');

// Apply user-based rate limiting to all routes
router.use(protect, userApiLimiter);

// Admin routes use admin limiter
router.use('/:id/role', adminLimiter);

// @route   GET /api/users/profile
router.get('/profile', getProfile);

// @route   PUT /api/users/profile
router.put('/profile', auditLog, updateProfile);

// @route   PUT /api/users/change-password
router.put('/change-password', auditLog, changePassword);

// Admin routes
// @route   GET /api/users
router.get('/', requireAdmin, paginationValidator, validate, getAllUsers);

// @route   GET /api/users/:id
router.get('/:id', requireAdmin, mongoIdValidator, validate, getUserById);

// @route   PUT /api/users/:id
router.put(
    '/:id',
    requireAdmin,
    auditLog,
    mongoIdValidator,
    [
        body('name').optional().trim().notEmpty(),
        body('email').optional().isEmail(),
        body('phone').optional().trim().notEmpty(),
        body('isEmailVerified').optional().isBoolean(),
        body('role').optional().isIn(['user', 'admin'])
    ],
    validate,
    updateUser
);

// @route   PUT /api/users/:id/role
router.put(
    '/:id/role',
    requireAdmin,
    auditLog,
    mongoIdValidator,
    [body('role').isIn(['user', 'admin']).withMessage('Invalid role')],
    validate,
    updateUserRole
);

// @route   DELETE /api/users/:id
router.delete('/:id', requireAdmin, auditLog, mongoIdValidator, validate, deleteUser);

// @route   POST /api/users/bulk
router.post(
    '/bulk',
    requireAdmin,
    auditLog,
    [
        body('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
        body('userIds.*').isMongoId().withMessage('All user IDs must be valid'),
        body('updates').isObject().withMessage('Updates object is required')
    ],
    validate,
    bulkUpdateUsers
);

module.exports = router;
