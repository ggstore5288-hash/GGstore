const PromoCode = require('../models/PromoCode');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Validate promo code
 * @route   POST /api/promo-codes/validate
 * @access  Private
 */
const validatePromoCode = async (req, res, next) => {
    try {
        const { code } = req.body;

        const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });
        if (!promoCode) {
            return next(new AppError('Invalid promo code', HTTP_STATUS.NOT_FOUND));
        }

        const validation = promoCode.isValid();
        if (!validation.valid) {
            return next(new AppError(validation.message, HTTP_STATUS.BAD_REQUEST));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Promo code is valid',
            data: { promoCode }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all promo codes (Admin)
 * @route   GET /api/promo-codes
 * @access  Private/Admin
 */
const getPromoCodes = async (req, res, next) => {
    try {
        const { active } = req.query;

        const query = {};
        if (active === 'true') query.isActive = true;

        const promoCodes = await PromoCode.find(query).sort({ createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { promoCodes }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create promo code (Admin)
 * @route   POST /api/promo-codes
 * @access  Private/Admin
 */
const createPromoCode = async (req, res, next) => {
    try {
        const promoCodeData = { ...req.body };
        promoCodeData.code = promoCodeData.code.toUpperCase();

        const promoCode = await PromoCode.create(promoCodeData);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Promo code created successfully',
            data: { promoCode }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update promo code (Admin)
 * @route   PUT /api/promo-codes/:id
 * @access  Private/Admin
 */
const updatePromoCode = async (req, res, next) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);
        if (!promoCode) {
            return next(new AppError('Promo code not found', HTTP_STATUS.NOT_FOUND));
        }

        Object.keys(req.body).forEach((key) => {
            if (req.body[key] !== undefined) {
                if (key === 'code') {
                    promoCode[key] = req.body[key].toUpperCase();
                } else {
                    promoCode[key] = req.body[key];
                }
            }
        });

        await promoCode.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Promo code updated successfully',
            data: { promoCode }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete promo code (Admin)
 * @route   DELETE /api/promo-codes/:id
 * @access  Private/Admin
 */
const deletePromoCode = async (req, res, next) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);
        if (!promoCode) {
            return next(new AppError('Promo code not found', HTTP_STATUS.NOT_FOUND));
        }

        await promoCode.deleteOne();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Promo code deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle promo code status (Admin)
 * @route   PATCH /api/promo-codes/:id/toggle
 * @access  Private/Admin
 */
const togglePromoCodeStatus = async (req, res, next) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);
        if (!promoCode) {
            return next(new AppError('Promo code not found', HTTP_STATUS.NOT_FOUND));
        }

        promoCode.isActive = !promoCode.isActive;
        await promoCode.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Promo code ${promoCode.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { promoCode }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get promo code stats (Admin)
 * @route   GET /api/promo-codes/stats
 * @access  Private/Admin
 */
const getPromoStats = async (req, res, next) => {
    try {
        const totalCodes = await PromoCode.countDocuments();
        const activeCodes = await PromoCode.countDocuments({ isActive: true });
        const expiredCodes = await PromoCode.countDocuments({ expirationDate: { $lt: new Date() } });

        const usageResult = await PromoCode.aggregate([
            { $group: { _id: null, total: { $sum: '$usedCount' } } }
        ]);
        const totalUsage = usageResult.length > 0 ? usageResult[0].total : 0;

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                totalCodes,
                activeCodes,
                expiredCodes,
                totalUsage
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single promo code stats (Admin)
 * @route   GET /api/promo-codes/:id/stats
 * @access  Private/Admin
 */
const getPromoCodeStats = async (req, res, next) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);
        if (!promoCode) {
            return next(new AppError('Promo code not found', HTTP_STATUS.NOT_FOUND));
        }

        // For now, return the promo code itself and its usage count
        // In a real app, you might want to aggregate orders to see total revenue generated by this code
        // But for now, we'll just return what's on the model

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                promoCode,
                usageCount: promoCode.usedCount,
                isValid: promoCode.isValid()
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validatePromoCode,
    getPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    togglePromoCodeStatus,
    getPromoStats,
    getPromoCodeStats
};
