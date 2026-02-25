const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Validate request using express-validator
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg
        }));

        console.error('Validation Errors:', JSON.stringify(errorMessages, null, 2));

        return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
            success: false,
            error: 'Validation failed',
            errors: errorMessages
        });
    }

    next();
};

module.exports = validate;
