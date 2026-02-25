/**
 * Format image URL to include full path if needed
 * @param {string} imagePath - Relative image path
 * @returns {string} - Full image URL or relative path
 */
const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath; // External link
    // Modify this if you have a specific prefix or CDN
    return imagePath.replace(/\\/g, '/');
};

/**
 * Get pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Limit per page
 * @returns {object} - { skip, limit, page }
 */
const getPagination = (page, limit) => {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    return { skip, limit: limitNum, page: pageNum };
};

/**
 * Create pagination metadata
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Pagination meta object
 */
const createPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
};

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename
 */
const generateUniqueFilename = (originalName) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    // You might want to extract extension here
    return `${timestamp}-${random}-${originalName}`;
};

/**
 * Generate random verification code
 * @param {number} length - Length of code
 * @returns {string} - Random numeric code
 */
const generateVerificationCode = (length = 6) => {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10).toString();
    }
    return code;
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-Random
 * @returns {string} - Order number
 */
const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Check if a date is expired
 * @param {Date} date - Date to check
 * @returns {boolean} - True if expired
 */
const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
};

module.exports = {
    formatImageUrl,
    getPagination,
    createPaginationMeta,
    isExpired,
    generateUniqueFilename,
    generateVerificationCode,
    formatCurrency,
    generateOrderNumber
};
