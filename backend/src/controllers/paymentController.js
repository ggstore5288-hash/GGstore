const Payment = require('../models/Payment');
const Order = require('../models/Order');
const PromoCode = require('../models/PromoCode');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS, PAYMENT_STATUS, ORDER_STATUS } = require('../utils/constants');
const { getFilePath } = require('../services/uploadService');
const { sendPaymentConfirmationEmail } = require('../services/emailService');
const { getPagination, createPaginationMeta } = require('../utils/helpers');

/**
 * @desc    Submit payment with proof
 * @route   POST /api/payments
 * @access  Private
 */
const submitPayment = async (req, res, next) => {
    try {
        const { orderId, paymentMethod, phoneNumber } = req.body;

        if (!req.file) {
            return next(new AppError('Payment proof image is required', HTTP_STATUS.BAD_REQUEST));
        }

        // Check order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
        }

        // Ensure user owns the order
        if (order.user.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({ order: orderId });
        if (existingPayment) {
            return next(new AppError('Payment already submitted for this order', HTTP_STATUS.CONFLICT));
        }

        // Create payment
        const payment = await Payment.create({
            order: orderId,
            user: req.user._id,
            method: paymentMethod,
            phoneNumber,
            proofImage: getFilePath(req.file)
        });

        // Update order with payment reference
        order.payment = payment._id;
        await order.save();

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Payment submitted successfully. Awaiting admin confirmation.',
            data: { payment }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get payment status
 * @route   GET /api/payments/:orderId
 * @access  Private
 */
const getPaymentStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const payment = await Payment.findOne({ order: orderId })
            .populate('order')
            .populate('confirmedBy', 'name');

        if (!payment) {
            return next(new AppError('Payment not found', HTTP_STATUS.NOT_FOUND));
        }

        // Ensure user owns the payment
        if (payment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { payment }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all payments (Admin)
 * @route   GET /api/payments
 * @access  Private/Admin
 */
const getAllPayments = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const query = {};
        if (status) query.status = status;

        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('user', 'name email')
            .populate('order', 'orderNumber total')
            .populate('confirmedBy', 'name');

        const total = await Payment.countDocuments(query);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                payments,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Confirm payment (Admin)
 * @route   PATCH /api/payments/:id/confirm
 * @access  Private/Admin
 */
const confirmPayment = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('order user');
        if (!payment) {
            return next(new AppError('Payment not found', HTTP_STATUS.NOT_FOUND));
        }

        if (payment.status === PAYMENT_STATUS.CONFIRMED) {
            return next(new AppError('Payment already confirmed', HTTP_STATUS.BAD_REQUEST));
        }

        // Update payment
        payment.status = PAYMENT_STATUS.CONFIRMED;
        payment.confirmedBy = req.user._id;
        payment.confirmedAt = Date.now();
        await payment.save();

        // Update order
        const order = await Order.findById(payment.order._id);
        order.paymentStatus = PAYMENT_STATUS.CONFIRMED;
        order.orderStatus = ORDER_STATUS.PROCESSING;
        await order.save();

        // Award loyalty points when payment is confirmed
        const { awardPointsForOrder } = require('../controllers/loyaltyController');
        awardPointsForOrder(payment.user._id, order)
            .catch(err => console.error('Error awarding loyalty points:', err));

        // Send confirmation email
        try {
            await sendPaymentConfirmationEmail(payment.user.email, payment.user.name, order);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Payment confirmed successfully',
            data: { payment }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reject payment (Admin)
 * @route   PATCH /api/payments/:id/reject
 * @access  Private/Admin
 */
const rejectPayment = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const payment = await Payment.findById(req.params.id).populate('order');
        if (!payment) {
            return next(new AppError('Payment not found', HTTP_STATUS.NOT_FOUND));
        }

        if (payment.status === PAYMENT_STATUS.REJECTED) {
            return next(new AppError('Payment already rejected', HTTP_STATUS.BAD_REQUEST));
        }

        // Update payment
        payment.status = PAYMENT_STATUS.REJECTED;
        payment.confirmedBy = req.user._id;
        payment.confirmedAt = Date.now();
        payment.rejectionReason = reason || 'Payment verification failed';
        await payment.save();

        // Update order
        const order = await Order.findById(payment.order._id);
        order.paymentStatus = PAYMENT_STATUS.REJECTED;
        await order.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Payment rejected',
            data: { payment }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitPayment,
    getPaymentStatus,
    getAllPayments,
    confirmPayment,
    rejectPayment
};
