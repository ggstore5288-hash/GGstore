const PaymentMethod = require('../models/PaymentMethod');
const { HTTP_STATUS } = require('../utils/constants');

// @desc    Get active payment methods for checkout
// @route   GET /api/payment-methods
// @access  Public
const getActivePaymentMethods = async (req, res, next) => {
    try {
        const methods = await PaymentMethod.find({ isActive: true }).sort({ order: 1 });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: methods
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getActivePaymentMethods
};
