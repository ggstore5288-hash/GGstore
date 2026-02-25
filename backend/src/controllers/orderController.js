const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const PromoCode = require('../models/PromoCode');
const Payment = require('../models/Payment');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../utils/constants');
const { getPagination, createPaginationMeta, generateOrderNumber } = require('../utils/helpers');
const { sendOrderConfirmationEmail } = require('../services/emailService');
const { redeemPoints } = require('./loyaltyController');

// Helper function to validate stock
const validateStock = (items) => {
    const errors = [];
    let valid = true;

    for (const item of items) {
        if (item.product.stock < item.quantity) {
            errors.push(`${item.product.name} has insufficient stock`);
            valid = false;
        }
    }

    return { valid, errors };
};

/**
 * @desc    Create order from cart
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
    try {
        const { phone, paymentMethod, paymentProof, phoneNumber } = req.body;


        // Get cart
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product promoCode');
        if (!cart || cart.items.length === 0) {
            return next(new AppError('Cart is empty', HTTP_STATUS.BAD_REQUEST));
        }

        // Validate stock
        const stockValidation = validateStock(cart.items);
        if (!stockValidation.valid) {
            return next(new AppError(`Some items in your cart are out of stock: ${stockValidation.errors.join(', ')}`, HTTP_STATUS.BAD_REQUEST));
        }

        // Create order items snapshot
        const orderItems = cart.items.map((item) => ({
            product: item.product._id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity
        }));

        // Deduct loyalty points if used
        if (cart.pointsUsed > 0) {

            // Attempt to redeem logic (deduct points)
            const redemptionResult = await redeemPoints(req.user._id, cart.pointsUsed);

            if (!redemptionResult.success) {
                return next(new AppError(`Failed to redeem points: ${redemptionResult.message}`, HTTP_STATUS.BAD_REQUEST));
            }

        }

        // Create order
        const order = await Order.create({
            user: req.user._id,
            orderNumber: generateOrderNumber(),
            items: orderItems,
            subtotal: cart.subtotal,
            discount: cart.discount,
            total: cart.total,
            pointsUsed: cart.pointsUsed || 0,
            pointsDiscount: cart.pointsDiscount || 0,
            customerInfo: {
                name: req.user.name,
                email: req.user.email,
                phone
            },
            paymentMethod,
            promoCode: cart.promoCode,
            trackingHistory: [{
                status: ORDER_STATUS.NEW,
                message: 'Order placed successfully',
                updatedAt: new Date(),
                updatedBy: 'system'
            }]
        });

        // Handle Payment creation if proof is provided (Manual Payment)
        if (paymentProof && phoneNumber && [PAYMENT_METHODS.INSTAPAY, PAYMENT_METHODS.VODAFONE_CASH, PAYMENT_METHODS.TELDA].includes(paymentMethod)) {

            const payment = await Payment.create({
                order: order._id,
                user: req.user._id,
                method: paymentMethod,
                phoneNumber: phoneNumber, // The number user sent money FROM
                proofImage: paymentProof,
                status: PAYMENT_STATUS.PENDING
            });

            order.payment = payment._id;
            order.paymentStatus = PAYMENT_STATUS.PENDING;
            await order.save();
        }

        // Update product stock and purchase count
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: {
                    stock: -item.quantity,
                    purchaseCount: item.quantity
                }
            });
        }

        // Update promo code usage
        if (cart.promoCode) {
            await PromoCode.findByIdAndUpdate(cart.promoCode._id, {
                $inc: { usedCount: 1 }
            });
        }

        // Loyalty points will be awarded when payment is confirmed (in paymentController)

        // Clear cart
        cart.items = [];
        cart.subtotal = 0;
        cart.discount = 0;
        cart.total = 0;
        cart.promoCode = null;
        cart.pointsUsed = 0;
        cart.pointsDiscount = 0;
        await cart.save();

        // Send confirmation email
        try {
            await sendOrderConfirmationEmail(req.user.email, req.user.name, order);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        await order.populate('items.product');

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Order created successfully',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('items.product');

        const total = await Order.countDocuments({ user: req.user._id });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                orders,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product')
            .populate('payment');

        if (!order) {
            return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
        }

        // Ensure user owns the order (unless admin)
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders/all
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, paymentStatus } = req.query;
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        const query = {};
        if (status) query.orderStatus = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('user', 'name email')
            .populate('items.product')
            .populate('payment');

        const total = await Order.countDocuments(query);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                orders,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update order status (Admin)
 * @route   PATCH /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, message } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
        }

        const oldStatus = order.orderStatus;
        order.orderStatus = status;

        // Add tracking history entry
        const statusMessages = {
            [ORDER_STATUS.NEW]: 'Order placed successfully',
            [ORDER_STATUS.PROCESSING]: 'Order is being processed',
            [ORDER_STATUS.COMPLETED]: 'Order completed and delivered',
            [ORDER_STATUS.CANCELLED]: 'Order has been cancelled'
        };

        order.trackingHistory.push({
            status,
            message: message || statusMessages[status] || 'Order status updated',
            updatedAt: new Date(),
            updatedBy: 'admin'
        });

        // Set deliveredAt when completed
        if (status === ORDER_STATUS.COMPLETED && !order.deliveredAt) {
            order.deliveredAt = new Date();
        }

        await order.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Order status updated',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get order tracking information
 * @route   GET /api/orders/:id/tracking
 * @access  Private
 */
const getOrderTracking = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .select('orderNumber orderStatus trackingHistory estimatedDelivery deliveredAt createdAt user');

        if (!order) {
            return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
        }

        // Ensure user owns the order (unless admin)
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                orderNumber: order.orderNumber,
                currentStatus: order.orderStatus,
                trackingHistory: order.trackingHistory,
                estimatedDelivery: order.estimatedDelivery,
                deliveredAt: order.deliveredAt,
                createdAt: order.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel order
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new AppError('Order not found', HTTP_STATUS.NOT_FOUND));
        }

        // Ensure user owns the order
        if (order.user.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized', HTTP_STATUS.FORBIDDEN));
        }

        // Can only cancel pending orders
        if (order.orderStatus !== ORDER_STATUS.NEW) {
            return next(new AppError('Cannot cancel this order', HTTP_STATUS.BAD_REQUEST));
        }

        order.orderStatus = ORDER_STATUS.CANCELLED;
        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Order cancelled',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderTracking
};
