const Banner = require('../models/Banner');
const FeaturedProduct = require('../models/FeaturedProduct');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { getFilePath } = require('../services/uploadService');

// ========== BANNER CONTROLLERS ==========

/**
 * @desc    Get all banners
 * @route   GET /api/content/banners
 * @access  Public
 */
const getBanners = async (req, res, next) => {
    try {
        const { position, active } = req.query;

        const query = {};
        if (position) query.position = position;
        if (active === 'true') query.isActive = true;

        const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });

        res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { banners }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create banner (Admin)
 * @route   POST /api/content/banners
 * @access  Private/Admin
 */
const createBanner = async (req, res, next) => {
    try {
        const { title, link, position, order, isActive } = req.body;

        if (!req.file) {
            return next(new AppError('Banner image is required', HTTP_STATUS.BAD_REQUEST));
        }

        // If making this banner active and it's for homepage, deactivate others
        if (isActive === 'true' || isActive === true) {
            await Banner.updateMany(
                { position: position || 'homepage', isActive: true },
                { isActive: false }
            );
        }

        const banner = await Banner.create({
            title,
            image: req.uploadedImages?.bannerImage || (req.file ? getFilePath(req.file) : null),
            link,
            position,
            order,
            isActive: isActive === 'true' || isActive === true
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Banner created successfully',
            data: { banner }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update banner (Admin)
 * @route   PUT /api/content/banners/:id
 * @access  Private/Admin
 */
const updateBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return next(new AppError('Banner not found', HTTP_STATUS.NOT_FOUND));
        }

        const { title, link, position, order, isActive } = req.body;

        // If setting to active, deactivate others in same position
        if (isActive === 'true' || isActive === true) {
            const targetPosition = position || banner.position;
            await Banner.updateMany(
                {
                    _id: { $ne: banner._id },
                    position: targetPosition,
                    isActive: true
                },
                { isActive: false }
            );
        }

        if (title) banner.title = title;
        if (link !== undefined) banner.link = link;
        if (position) banner.position = position;
        if (order !== undefined) banner.order = order;
        if (isActive !== undefined) banner.isActive = isActive;
        
        // Use processed image URL from middleware if a file was uploaded
        if (req.uploadedImages?.bannerImage) {
            banner.image = req.uploadedImages.bannerImage;
        } else if (req.file) {
            banner.image = getFilePath(req.file);
        }

        await banner.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Banner updated successfully',
            data: { banner }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete banner (Admin)
 * @route   DELETE /api/content/banners/:id
 * @access  Private/Admin
 */
const deleteBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return next(new AppError('Banner not found', HTTP_STATUS.NOT_FOUND));
        }

        await banner.deleteOne();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Banner deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// ========== FEATURED PRODUCT CONTROLLERS ==========

/**
 * @desc    Get featured products
 * @route   GET /api/content/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res, next) => {
    try {
        const { section, active } = req.query;

        const query = {};
        if (section) query.section = section;
        if (active === 'true') query.isActive = true;

        const featuredProducts = await FeaturedProduct.find(query)
            .populate('product')
            .sort({ order: 1, createdAt: -1 });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { featuredProducts }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add featured product (Admin)
 * @route   POST /api/content/featured
 * @access  Private/Admin
 */
const addFeaturedProduct = async (req, res, next) => {
    try {
        const { productId, section, order } = req.body;

        const featuredProduct = await FeaturedProduct.create({
            product: productId,
            section,
            order
        });

        await featuredProduct.populate('product');

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Featured product added successfully',
            data: { featuredProduct }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update featured product (Admin)
 * @route   PUT /api/content/featured/:id
 * @access  Private/Admin
 */
const updateFeaturedProduct = async (req, res, next) => {
    try {
        const featuredProduct = await FeaturedProduct.findById(req.params.id);
        if (!featuredProduct) {
            return next(new AppError('Featured product not found', HTTP_STATUS.NOT_FOUND));
        }

        const { section, order, isActive } = req.body;

        if (section) featuredProduct.section = section;
        if (order !== undefined) featuredProduct.order = order;
        if (isActive !== undefined) featuredProduct.isActive = isActive;

        await featuredProduct.save();
        await featuredProduct.populate('product');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Featured product updated successfully',
            data: { featuredProduct }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove featured product (Admin)
 * @route   DELETE /api/content/featured/:id
 * @access  Private/Admin
 */
const removeFeaturedProduct = async (req, res, next) => {
    try {
        const featuredProduct = await FeaturedProduct.findById(req.params.id);
        if (!featuredProduct) {
            return next(new AppError('Featured product not found', HTTP_STATUS.NOT_FOUND));
        }

        await featuredProduct.deleteOne();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Featured product removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reorder banners
 * @route   POST /api/content/banners/reorder
 * @access  Private/Admin
 */
const reorderBanners = async (req, res, next) => {
    try {
        const { bannerOrders } = req.body;

        if (!Array.isArray(bannerOrders)) {
            return next(new AppError('bannerOrders must be an array', HTTP_STATUS.BAD_REQUEST));
        }

        const updatePromises = bannerOrders.map(order => 
            Banner.findByIdAndUpdate(order.bannerId, { order: order.order })
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
 * @desc    Reorder featured products
 * @route   POST /api/content/featured/reorder
 * @access  Private/Admin
 */
const reorderFeatured = async (req, res, next) => {
    try {
        const { featuredOrders } = req.body;

        if (!Array.isArray(featuredOrders)) {
            return next(new AppError('featuredOrders must be an array', HTTP_STATUS.BAD_REQUEST));
        }

        const updatePromises = featuredOrders.map(order => 
            FeaturedProduct.findByIdAndUpdate(order.featuredId, { order: order.order })
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
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    getFeaturedProducts,
    addFeaturedProduct,
    updateFeaturedProduct,
    removeFeaturedProduct,
    reorderFeatured,
    reorderBanners
};
