const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditLogById } = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { paginationValidator, mongoIdValidator } = require('../utils/validators');
const validate = require('../middleware/validateMiddleware');

// All routes require admin access
router.use(protect, requireAdmin);

// @route   GET /api/audit-logs
router.get('/', paginationValidator, validate, getAuditLogs);

// @route   GET /api/audit-logs/:id
router.get('/:id', mongoIdValidator, validate, getAuditLogById);

module.exports = router;
