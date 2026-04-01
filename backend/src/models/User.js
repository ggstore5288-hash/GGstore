const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES } = require('../utils/constants');
const { generateVerificationCode } = require('../utils/helpers');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false // Don't return password by default
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true
        },
        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            default: USER_ROLES.USER
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        verificationCode: {
            type: String,
            select: false
        },
        verificationCodeExpires: {
            type: Date,
            select: false
        },
        resetPasswordToken: {
            type: String,
            select: false
        },
        resetPasswordExpires: {
            type: Date,
            select: false
        },
        refreshToken: {
            type: String,
            select: false
        },
        refreshTokenExpires: {
            type: Date,
            select: false
        },
        failedLoginAttempts: {
            type: Number,
            default: 0
        },
        accountLockedUntil: {
            type: Date,
            select: false
        },
        passwordHistory: {
            type: [String],
            select: false,
            default: []
        },
        expireAt: {
            type: Date,
            index: { expires: 0 }, // TTL index: document expires at this date
            select: false
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster queries

userSchema.index({ role: 1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ role: 1, isEmailVerified: 1 }); // Compound index for admin queries
userSchema.index({ createdAt: -1 }); // For sorting by registration date

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    // Store old password hash in history (keep last 5)
    if (this.isNew === false && this.passwordHistory) {
        const oldPasswordHash = this.password;
        if (oldPasswordHash && !oldPasswordHash.startsWith('$2')) {
            // Only add if it's already hashed (not a new password)
            // We'll handle this after hashing
        }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);

    // Store previous password hash in history before updating
    if (!this.isNew && this.passwordHistory) {
        // Get the current password hash before it's changed
        const currentDoc = await this.constructor.findById(this._id).select('+password');
        if (currentDoc && currentDoc.password) {
            this.passwordHistory = [
                currentDoc.password,
                ...(this.passwordHistory || []).slice(0, 4) // Keep last 5
            ];
        }
    }

    this.password = hashedPassword;
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate verification code
userSchema.methods.generateVerificationCode = function () {
    const code = generateVerificationCode(6);
    this.verificationCode = code;
    this.verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    return code;
};

// Generate password reset code
userSchema.methods.generatePasswordResetCode = function () {
    const code = generateVerificationCode(6);
    this.resetPasswordToken = code;
    this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    return code;
};

// Check if account is locked
userSchema.methods.isAccountLocked = function () {
    return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

// Lock account after failed attempts
userSchema.methods.incrementFailedAttempts = async function () {
    this.failedLoginAttempts += 1;

    // Lock account after 10 failed attempts for 30 minutes
    if (this.failedLoginAttempts >= 10) {
        this.accountLockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
    }

    await this.save();
};

// Reset failed attempts on successful login
userSchema.methods.resetFailedAttempts = async function () {
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = undefined;
    await this.save();
};

// Check if password was recently used
userSchema.methods.isPasswordInHistory = async function (newPassword) {
    if (!this.passwordHistory || this.passwordHistory.length === 0) {
        return false;
    }

    for (const oldHash of this.passwordHistory) {
        const isMatch = await bcrypt.compare(newPassword, oldHash);
        if (isMatch) {
            return true;
        }
    }

    return false;
};

// Convert to JSON - remove sensitive fields
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.verificationCode;
    delete user.verificationCodeExpires;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    delete user.refreshToken;
    delete user.refreshTokenExpires;
    delete user.accountLockedUntil;
    return user;
};

module.exports = mongoose.model('User', userSchema);
