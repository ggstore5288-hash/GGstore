const User = require('../models/User');
const Session = require('../models/Session');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../services/tokenService');
const { sendVerificationEmail, sendPasswordResetCodeEmail } = require('../services/emailService');
const { recordFailedAttempt, recordAccountLocked } = require('../utils/securityMonitor');

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email already registered', HTTP_STATUS.CONFLICT));
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours to verify
        });

        // Generate verification code
        const verificationCode = user.generateVerificationCode();
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(email, name, verificationCode);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue even if email fails
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Account created successfully. Please check your email for verification code.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new AppError('No account found with this email address', HTTP_STATUS.UNAUTHORIZED));
        }

        // Check if account is locked
        if (user.isAccountLocked()) {
            return next(new AppError('Account is temporarily locked due to too many failed login attempts. Please try again later.', HTTP_STATUS.FORBIDDEN));
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            await user.incrementFailedAttempts();
            // Monitor for brute-force: record global spike + per-account lock alerts
            recordFailedAttempt(req.ip, email);
            if (user.failedLoginAttempts >= 10) {
                recordAccountLocked(email, req.ip);
            }
            return next(new AppError('Incorrect password. Please try again.', HTTP_STATUS.UNAUTHORIZED));
        }

        // Reset failed attempts on successful login
        await user.resetFailedAttempts();

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Store refresh token in database (expires in 7 days)
        user.refreshToken = refreshToken;
        user.refreshTokenExpires = expiresAt;
        await user.save({ validateBeforeSave: false });

        // Create session record
        await Session.create({
            user: user._id,
            refreshToken,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            expiresAt,
            isActive: true
        });

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                token: accessToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify email with code
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { email, code } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires');
        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Email already verified'
            });
        }

        // Check verification code
        if (user.verificationCode !== code) {
            return next(new AppError('Invalid verification code', HTTP_STATUS.BAD_REQUEST));
        }

        // Check if code expired
        if (user.verificationCodeExpires < Date.now()) {
            return next(new AppError('Verification code has expired', HTTP_STATUS.BAD_REQUEST));
        }

        user.isEmailVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        user.expireAt = undefined; // Remove TTL index once verified
        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Store refresh token in database
        user.refreshToken = refreshToken;
        user.refreshTokenExpires = expiresAt;
        await user.save({ validateBeforeSave: false });

        // Create session record
        await Session.create({
            user: user._id,
            refreshToken,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            expiresAt,
            isActive: true
        });

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Email verified successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                token: accessToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Resend verification code
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
const resendVerificationCode = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return next(new AppError('Email already verified', HTTP_STATUS.BAD_REQUEST));
        }

        // Generate new verification code
        const verificationCode = user.generateVerificationCode();
        user.expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Give another 24 hours on resend
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(email, user.name, verificationCode);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return next(new AppError('Failed to send verification email', HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Verification code sent to your email'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Forgot password - send reset code
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        // Generate reset code
        const resetCode = user.generatePasswordResetCode();
        await user.save();

        // Send reset email with code
        try {
            await sendPasswordResetCodeEmail(email, user.name, resetCode);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return next(new AppError('Failed to send reset email', HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Password reset code sent to your email'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify reset code
 * @route   POST /api/auth/verify-reset-code
 * @access  Public
 */
const verifyResetCode = async (req, res, next) => {
    try {
        const { email, code } = req.body;

        // Find user with valid reset code
        const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        // Check reset code
        if (user.resetPasswordToken !== code) {
            return next(new AppError('Invalid verification code', HTTP_STATUS.BAD_REQUEST));
        }

        // Check if code expired
        if (user.resetPasswordExpires < Date.now()) {
            return next(new AppError('Verification code has expired', HTTP_STATUS.BAD_REQUEST));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Code verified successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset password with code
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
    try {
        const { email, code, newPassword } = req.body;

        // Find user with valid reset code
        const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        // Verify the code again
        if (user.resetPasswordToken !== code) {
            return next(new AppError('Invalid verification code', HTTP_STATUS.BAD_REQUEST));
        }

        // Check if code expired
        if (user.resetPasswordExpires < Date.now()) {
            return next(new AppError('Verification code has expired', HTTP_STATUS.BAD_REQUEST));
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public (but requires refresh token)
 */
const refreshToken = async (req, res, next) => {
    try {
        // Get refresh token from cookie or body
        const refreshTokenValue = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshTokenValue) {
            return next(new AppError('Refresh token is required', HTTP_STATUS.UNAUTHORIZED));
        }

        // Find user with this refresh token
        const user = await User.findOne({ refreshToken: refreshTokenValue }).select('+refreshToken +refreshTokenExpires');

        if (!user) {
            return next(new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED));
        }

        // Verify refresh token
        if (!verifyRefreshToken(refreshTokenValue, user)) {
            // Clear invalid refresh token
            user.refreshToken = undefined;
            user.refreshTokenExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return next(new AppError('Refresh token expired or invalid', HTTP_STATUS.UNAUTHORIZED));
        }

        // Generate new access token
        const accessToken = generateAccessToken(user._id);

        // Rotate refresh token (for better security)
        const newRefreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        user.refreshToken = newRefreshToken;
        user.refreshTokenExpires = expiresAt;
        await user.save({ validateBeforeSave: false });

        // Update session
        await Session.findOneAndUpdate(
            { refreshToken: refreshTokenValue },
            {
                refreshToken: newRefreshToken,
                expiresAt,
                lastActivity: Date.now()
            }
        );

        // Set new refresh token in cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token: accessToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Logout user (revoke refresh token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const user = await User.findById(req.user._id);

        if (user) {
            // Clear refresh token
            user.refreshToken = undefined;
            user.refreshTokenExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }

        // Deactivate session
        if (refreshToken) {
            await Session.findOneAndUpdate(
                { refreshToken },
                { isActive: false }
            );
        }

        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all active sessions for current user
 * @route   GET /api/auth/sessions
 * @access  Private
 */
const getSessions = async (req, res, next) => {
    try {
        const sessions = await Session.find({
            user: req.user._id,
            isActive: true,
            expiresAt: { $gt: new Date() }
        })
            .sort({ lastActivity: -1 })
            .select('-refreshToken'); // Don't expose refresh tokens

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { sessions }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Revoke a specific session
 * @route   DELETE /api/auth/sessions/:sessionId
 * @access  Private
 */
const revokeSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findOne({
            _id: sessionId,
            user: req.user._id
        });

        if (!session) {
            return next(new AppError('Session not found', HTTP_STATUS.NOT_FOUND));
        }

        // Deactivate session
        session.isActive = false;
        await session.save();

        // If this is the current session, also clear user's refresh token
        const refreshToken = req.cookies.refreshToken;
        if (session.refreshToken === refreshToken) {
            const user = await User.findById(req.user._id);
            if (user) {
                user.refreshToken = undefined;
                user.refreshTokenExpires = undefined;
                await user.save({ validateBeforeSave: false });
            }
            res.clearCookie('refreshToken');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Session revoked successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Revoke all other sessions (keep current)
 * @route   DELETE /api/auth/sessions
 * @access  Private
 */
const revokeAllOtherSessions = async (req, res, next) => {
    try {
        const currentRefreshToken = req.cookies.refreshToken;

        // Deactivate all other sessions
        await Session.updateMany(
            {
                user: req.user._id,
                refreshToken: { $ne: currentRefreshToken },
                isActive: true
            },
            {
                isActive: false
            }
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'All other sessions revoked successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get CSRF token (sets cookie)
 * @route   GET /api/auth/csrf-token
 * @access  Public
 */
const getCsrfToken = async (req, res, next) => {
    // We rely on the middleware logic to set the token
    const { createCSRFToken } = require('../middleware/csrfMiddleware');
    createCSRFToken(req, res, () => {
        const token = res.getHeader('X-CSRF-Token');
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'CSRF token set',
            data: { token }
        });
    });
};

module.exports = {
    signup,
    login,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    refreshToken,
    logout,
    getSessions,
    revokeSession,
    revokeAllOtherSessions,
    getCsrfToken
};
