const Banner = require('../models/Banner');
const FeaturedProduct = require('../models/FeaturedProduct');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Get all banners with details (Admin)
 * @route   GET /api/admin/content/banners
 * @access  Private/Admin
 */
const getAllBannersAdmin = async (req, res, next) => {
    try {
        const banners = await Banner.find()
            .sort({ position: 1, order: 1, createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { banners }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all featured products with details (Admin)
 * @route   GET /api/admin/content/featured
 * @access  Private/Admin
 */
const getAllFeaturedAdmin = async (req, res, next) => {
    try {
        const { section } = req.query;

        const query = {};
        if (section) query.section = section;

        const featuredProducts = await FeaturedProduct.find(query)
            .populate('product')
            .sort({ section: 1, order: 1, createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { featuredProducts }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reorder banners (Admin)
 * @route   PATCH /api/admin/content/banners/reorder
 * @access  Private/Admin
 */
const reorderBanners = async (req, res, next) => {
    try {
        const { bannerOrders } = req.body; // [{ bannerId, order }, ...]

        if (!Array.isArray(bannerOrders)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: 'bannerOrders must be an array'
            });
        }

        const updatePromises = bannerOrders.map(({ bannerId, order }) =>
            Banner.findByIdAndUpdate(bannerId, { order })
        );

        await Promise.all(updatePromises);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Banners reordered successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reorder featured products (Admin)
 * @route   PATCH /api/admin/content/featured/reorder
 * @access  Private/Admin
 */
const reorderFeatured = async (req, res, next) => {
    try {
        const { featuredOrders } = req.body; // [{ featuredId, order }, ...]

        if (!Array.isArray(featuredOrders)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: 'featuredOrders must be an array'
            });
        }

        const updatePromises = featuredOrders.map(({ featuredId, order }) =>
            FeaturedProduct.findByIdAndUpdate(featuredId, { order })
        );

        await Promise.all(updatePromises);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Featured products reordered successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllBannersAdmin,
    getAllFeaturedAdmin,
    reorderBanners,
    reorderFeatured
};
