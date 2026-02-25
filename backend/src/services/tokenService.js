const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate JWT access token (short-lived)
 * @param {string} id - User ID
 * @returns {string} - JWT access token
 */
const generateAccessToken = (id) => {
    return jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '15m' // Short-lived: 15 minutes
    });
};

/**
 * Generate refresh token (long-lived, stored in DB)
 * @returns {string} - Refresh token
 */
const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

/**
 * Verify JWT access token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Verify refresh token (check in database)
 * @param {string} token - Refresh token
 * @param {object} user - User document
 * @returns {boolean} - True if valid
 */
const verifyRefreshToken = (token, user) => {
    if (!user.refreshToken || user.refreshToken !== token) {
        return false;
    }
    
    if (user.refreshTokenExpires && user.refreshTokenExpires < Date.now()) {
        return false;
    }
    
    return true;
};

/**
 * Generate password reset token
 * @param {string} id - User ID
 * @returns {string} - Reset token
 */
const generateResetToken = (id) => {
    return jwt.sign({ id, type: 'reset' }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
};

// Legacy support - map to new function
const generateToken = generateAccessToken;
const verifyToken = verifyAccessToken;

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateResetToken,
    // Legacy exports for backward compatibility
    generateToken,
    verifyToken
};
