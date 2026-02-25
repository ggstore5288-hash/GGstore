const User = require('../models/User');
const LoyaltyPoint = require('../models/LoyaltyPoint');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS, USER_ROLES } = require('../utils/constants');
const { validatePassword } = require('../utils/passwordSecurity');

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const loyalty = await LoyaltyPoint.findOne({ user: req.user._id });

        console.log('DEBUG: getProfile User:', JSON.stringify(user, null, 2));
        console.log('DEBUG: getProfile Loyalty:', JSON.stringify(loyalty, null, 2));

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                user: {
                    ...user.toObject(),
                    loyaltyPoints: loyalty?.points || 0,
                    loyaltyTier: loyalty?.tier || 'bronze'
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password +passwordHistory');
        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return next(new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST));
        }

        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return next(new AppError(passwordValidation.errors.join(', '), HTTP_STATUS.BAD_REQUEST));
        }

        // Check if new password is same as current
        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword) {
            return next(new AppError('New password must be different from current password', HTTP_STATUS.BAD_REQUEST));
        }

        // Check if password was recently used
        const isInHistory = await user.isPasswordInHistory(newPassword);
        if (isInHistory) {
            return next(new AppError('You cannot reuse a recently used password. Please choose a different password', HTTP_STATUS.BAD_REQUEST));
        }

        // Update password (password history is handled in pre-save hook)
        user.password = newPassword;
        await user.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role } = req.query;

        const query = {};
        if (role) query.role = role;

        const users = await User.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user role (Admin)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!Object.values(USER_ROLES).includes(role)) {
            return next(new AppError('Invalid role', HTTP_STATUS.BAD_REQUEST));
        }

        const user = await User.findById(id);
        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        user.role = role;
        await user.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'User role updated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user by ID (Admin)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -verificationCode -resetPasswordToken');

        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        // Get user's orders count
        const Order = require('../models/Order');
        const ordersCount = await Order.countDocuments({ user: user._id });

        // Get user's loyalty points
        const LoyaltyPoint = require('../models/LoyaltyPoint');
        const loyalty = await LoyaltyPoint.findOne({ user: user._id });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                user: {
                    ...user.toObject(),
                    ordersCount,
                    loyaltyPoints: loyalty?.points || 0,
                    loyaltyTier: loyalty?.tier || 'bronze'
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user (Admin)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res, next) => {
    try {
        const { name, email, phone, isEmailVerified, role } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        if (name) user.name = name;
        if (email && email !== user.email) {
            // Check if email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return next(new AppError('Email already in use', HTTP_STATUS.CONFLICT));
            }
            user.email = email;
            user.isEmailVerified = false; // Require re-verification if email changed
        }
        if (phone) user.phone = phone;
        if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;
        if (role && Object.values(USER_ROLES).includes(role)) user.role = role;

        await user.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return next(new AppError('Cannot delete your own account', HTTP_STATUS.BAD_REQUEST));
        }

        await user.deleteOne();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Bulk update users (Admin)
 * @route   POST /api/users/bulk
 * @access  Private/Admin
 */
const bulkUpdateUsers = async (req, res, next) => {
    try {
        const { userIds, updates } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return next(new AppError('User IDs array is required', HTTP_STATUS.BAD_REQUEST));
        }

        if (!updates || typeof updates !== 'object') {
            return next(new AppError('Updates object is required', HTTP_STATUS.BAD_REQUEST));
        }

        // Prevent bulk updating yourself
        if (userIds.includes(req.user._id.toString()) && updates.role) {
            return next(new AppError('Cannot change your own role via bulk update', HTTP_STATUS.BAD_REQUEST));
        }

        const result = await User.updateMany(
            { _id: { $in: userIds } },
            { $set: updates }
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `${result.modifiedCount} users updated`,
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
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    updateUserRole,
    getUserById,
    updateUser,
    deleteUser,
    bulkUpdateUsers
};
