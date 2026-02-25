const PaymentMethod = require('../models/PaymentMethod');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');

// @desc    Get all payment methods
// @route   GET /api/admin/payment-methods
// @access  Private/Admin
const getPaymentMethods = async (req, res, next) => {
    try {
        const methods = await PaymentMethod.find().sort({ order: 1 });
        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: methods
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new payment method
// @route   POST /api/admin/payment-methods
// @access  Private/Admin
const createPaymentMethod = async (req, res, next) => {
    try {
        const { id, name, number, isActive, icon, order } = req.body;

        const existing = await PaymentMethod.findOne({ id });
        if (existing) {
            return next(new AppError('Payment method with this ID already exists', HTTP_STATUS.CONFLICT));
        }

        const method = await PaymentMethod.create({ id, name, number, isActive, icon, order });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: method
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a payment method
// @route   PUT /api/admin/payment-methods/:id
// @access  Private/Admin
const updatePaymentMethod = async (req, res, next) => {
    try {
        const method = await PaymentMethod.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!method) {
            return next(new AppError('Payment method not found', HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: method
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a payment method
// @route   DELETE /api/admin/payment-methods/:id
// @access  Private/Admin
const deletePaymentMethod = async (req, res, next) => {
    try {
        const method = await PaymentMethod.findOneAndDelete({ id: req.params.id });

        if (!method) {
            return next(new AppError('Payment method not found', HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Payment method deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
};
