const Settings = require('../models/Settings');

// @desc    Get all public settings
// @route   GET /api/settings
// @access  Public
const getPublicSettings = async (req, res) => {
    try {
        const settings = await Settings.find({ isPublic: true });

        // Return a key-value map for easier frontend consumption
        const settingsMap = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});

        res.json({
            success: true,
            data: settingsMap
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching public settings',
            error: error.message
        });
    }
};

module.exports = { getPublicSettings };
