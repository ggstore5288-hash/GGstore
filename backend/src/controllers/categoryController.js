const Category = require('../models/Category');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { getFilePath } = require('../services/uploadService');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
    try {
        const { active } = req.query;

        const query = {};
        if (active === 'true') query.isActive = true;

        const categories = await Category.find(query).sort({ name: 1 });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { categories }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return next(new AppError('Category not found', HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { category }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const image = req.uploadedImages?.image || null;

        const category = await Category.create({
            name,
            description,
            image
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Category created successfully',
            data: { category }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const image = req.uploadedImages?.image;

        const category = await Category.findById(req.params.id);
        if (!category) {
            return next(new AppError('Category not found', HTTP_STATUS.NOT_FOUND));
        }

        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        if (image) category.image = image;

        await category.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Category updated successfully',
            data: { category }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return next(new AppError('Category not found', HTTP_STATUS.NOT_FOUND));
        }

        await category.deleteOne();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle category status
 * @route   PATCH /api/categories/:id/toggle
 * @access  Private/Admin
 */
const toggleCategoryStatus = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return next(new AppError('Category not found', HTTP_STATUS.NOT_FOUND));
        }

        category.isActive = !category.isActive;
        await category.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { category }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
};
