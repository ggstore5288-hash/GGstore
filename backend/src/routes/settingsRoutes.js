const express = require('express');
const router = express.Router();
const { getPublicSettings } = require('../controllers/settingsController');

// @route   GET /api/settings
router.get('/', getPublicSettings);

module.exports = router;
