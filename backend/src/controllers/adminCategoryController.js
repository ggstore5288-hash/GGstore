const Category = require('../models/Category');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { getPagination, createPaginationMeta } = require('../utils/helpers');

/**
 * @desc    Get category statistics (Admin)
 * @route   GET /api/admin/categories/stats
 * @access  Private/Admin
 */
const getCategoryStats = async (req, res, next) => {
    try {
        const categories = await Category.find();

        const stats = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({ category: category._id });
                const activeProductCount = await Product.countDocuments({
                    category: category._id,
                    isActive: true
                });
                const totalStock = await Product.aggregate([
                    { $match: { category: category._id } },
                    { $group: { _id: null, total: { $sum: '$stock' } } }
                ]);

                return {
                    categoryId: category._id,
                    categoryName: category.name,
                    totalProducts: productCount,
                    activeProducts: activeProductCount,
                    totalStock: totalStock[0]?.total || 0
                };
            })
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Bulk update categories (Admin)
 * @route   POST /api/admin/categories/bulk
 * @access  Private/Admin
 */
const bulkUpdateCategories = async (req, res, next) => {
    try {
        const { categoryIds, updates } = req.body;

        if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
            return next(new AppError('Category IDs array is required', HTTP_STATUS.BAD_REQUEST));
        }

        if (!updates || typeof updates !== 'object') {
            return next(new AppError('Updates object is required', HTTP_STATUS.BAD_REQUEST));
        }

        const result = await Category.updateMany(
            { _id: { $in: categoryIds } },
            { $set: updates }
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `${result.modifiedCount} categories updated`,
            data: {
                matched: result.matchedCount,
                modified: result.modifiedCount
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategoryStats,
    bulkUpdateCategories
};
