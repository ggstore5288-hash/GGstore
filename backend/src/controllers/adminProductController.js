const Product = require('../models/Product');
const Category = require('../models/Category');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { getPagination, createPaginationMeta } = require('../utils/helpers');

/**
 * @desc    Get all products with advanced filters (Admin)
 * @route   GET /api/admin/products
 * @access  Private/Admin
 */
const getAdminProducts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 50,
            category,
            type,
            platform,
            region,
            isActive,
            isFlashSale,
            isFeatured,
            minPrice,
            maxPrice,
            minStock,
            search,
            sort = '-createdAt'
        } = req.query;

        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        // Build query
        const query = {};
        if (category) query.category = category;
        if (type) query.type = type;
        if (platform) query.platform = platform;
        if (region) query.region = region;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (isFlashSale !== undefined) query.isFlashSale = isFlashSale === 'true';
        if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        if (minStock !== undefined && minStock !== '') {
            const stockVal = parseInt(minStock);
            if (!isNaN(stockVal)) {
                query.stock = { $gte: stockVal };
            }
        }
        if (search) {
            query.$text = { $search: search };
        }

        console.log('Admin Products Query:', JSON.stringify(query));
        console.log('Pagination:', { skip, limitNum, pageNum });

        const products = await Product.find(query)
            .populate('category', 'name')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        console.log('Products found:', products.length);
        console.log('Products:', JSON.stringify(products, null, 2));

        const total = await Product.countDocuments(query);
        console.log('Total count:', total);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                products,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        console.error('Admin Products Error:', error);
        next(error);
    }
};

/**
 * @desc    Set product as featured (Admin)
 * @route   PATCH /api/admin/products/:id/feature
 * @access  Private/Admin
 */
const toggleFeatured = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        product.isFeatured = !product.isFeatured;
        await product.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'}`,
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update product tags (Admin)
 * @route   PATCH /api/admin/products/:id/tags
 * @access  Private/Admin
 */
const updateProductTags = async (req, res, next) => {
    try {
        const { tags } = req.body;

        if (!Array.isArray(tags)) {
            return next(new AppError('Tags must be an array', HTTP_STATUS.BAD_REQUEST));
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        product.tags = tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
        await product.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Product tags updated',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get product statistics (Admin)
 * @route   GET /api/admin/products/stats
 * @access  Private/Admin
 */
const getProductStats = async (req, res, next) => {
    try {
        const stats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    activeProducts: {
                        $sum: { $cond: ['$isActive', 1, 0] }
                    },
                    totalStock: { $sum: '$stock' },
                    lowStock: {
                        $sum: { $cond: [{ $lte: ['$stock', 10] }, 1, 0] }
                    },
                    outOfStock: {
                        $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
                    },
                    flashSales: {
                        $sum: { $cond: ['$isFlashSale', 1, 0] }
                    },
                    featured: {
                        $sum: { $cond: ['$isFeatured', 1, 0] }
                    },
                    avgPrice: { $avg: '$price' },
                    totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
                }
            }
        ]);

        const categoryStats = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalStock: { $sum: '$stock' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const categoryIds = categoryStats.map(s => s._id);
        const categories = await Category.find({ _id: { $in: categoryIds } })
            .select('name');

        const categoryStatsWithNames = categoryStats.map(stat => {
            const category = categories.find(c => c._id.toString() === stat._id.toString());
            return {
                categoryId: stat._id,
                categoryName: category?.name || 'Unknown',
                count: stat.count,
                totalStock: stat.totalStock
            };
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                overview: stats[0] || {},
                byCategory: categoryStatsWithNames
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminProducts,
    toggleFeatured,
    updateProductTags,
    getProductStats
};
