const Product = require('../models/Product');
const Category = require('../models/Category');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { getPagination, createPaginationMeta } = require('../utils/helpers');
const { deleteFiles } = require('../middleware/uploadMiddleware');

/**
 * @desc    Get all products (Public)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            sort,
            category,
            type,
            platform,
            region,
            minPrice,
            maxPrice,
            rating
        } = req.query;

        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        // Build query
        const query = { isActive: true }; // Only show active products to public

        // Filters
        if (category) query.category = category;
        if (type) query.type = type;
        if (platform) query.platform = platform;
        if (region) query.region = region;

        // Price filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Rating filter
        if (rating) {
            query.averageRating = { $gte: parseFloat(rating) };
        }

        // Search text
        if (search) {
            query.$text = { $search: search };
        }

        // Sort
        let sortOption = { createdAt: -1 }; // Default: Newest first
        if (sort) {
            if (sort === 'price-asc') sortOption = { price: 1 };
            else if (sort === 'price-desc') sortOption = { price: -1 };
            else if (sort === 'rating') sortOption = { averageRating: -1 };
            else if (sort === 'popularity') sortOption = { purchaseCount: -1 };
            else if (sort === 'name-asc') sortOption = { name: 1 };
            else if (sort === 'name-desc') sortOption = { name: -1 };
        }

        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        const total = await Product.countDocuments(query);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                products,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get product by ID (Public)
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            isActive: true
        }).populate('category', 'name slug');

        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        // Increment view count
        product.viewCount += 1;
        await product.save({ validateBeforeSave: false });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get product by ID (Admin)
 * @route   GET /api/products/:id/admin
 * @access  Private/Admin
 */
const getProductByIdAdmin = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name');

        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new product (Admin)
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
    try {
        // req.body.images and req.body.bannerImages are handled by uploadMiddleware/processUploadedImages
        // If files were uploaded via multer, they might be in req.files

        // Handle images from middleware processing if available
        if (req.uploadedImages) {
            req.body.images = req.uploadedImages.images || [];
            req.body.bannerImages = req.uploadedImages.bannerImages || [];
        }

        const product = await Product.create(req.body);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update product (Admin)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        // Handle new images
        if (req.uploadedImages) {
            if (req.uploadedImages.images && req.uploadedImages.images.length > 0) {
                // Determine if we append or replace? Usually replacement or specific handling. 
                // For simplicity here, let's assume we append new ones, or replace if client sent clear flag.
                // But typically multipart update is tricky. Let's assume replacement for now if provided.
                // Or better, let generic body handling take precedence if client sends explicit array.
                // If files provided, append them.
                req.body.images = [...product.images, ...req.uploadedImages.images];
            }
            if (req.uploadedImages.bannerImages && req.uploadedImages.bannerImages.length > 0) {
                req.body.bannerImages = [...product.bannerImages, ...req.uploadedImages.bannerImages];
            }
        }

        // Update fields
        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete product (Admin)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        // Delete associated images
        const allImages = [...(product.images || []), ...(product.bannerImages || [])];
        if (allImages.length > 0) {
            // This assumes deleteFiles handles relative paths correctly as stored in DB
            // await deleteFiles(allImages); 
            // Commented out safety: deleting files should be careful.
        }

        await product.deleteOne();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle product status (active/inactive)
 * @route   PATCH /api/products/:id/toggle
 * @access  Private/Admin
 */
const toggleProductStatus = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        product.isActive = !product.isActive;
        await product.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Product ${product.isActive ? 'activated' : 'deactivated'}`,
            data: {
                _id: product._id,
                isActive: product.isActive
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    getProductByIdAdmin,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus
};
