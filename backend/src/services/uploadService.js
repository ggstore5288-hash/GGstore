const path = require('path');
const fs = require('fs').promises;
const { generateUniqueFilename } = require('../utils/helpers');

/**
 * Get file path from uploaded file
 * @param {object} file - Multer file object
 * @returns {string} - Relative file path
 */
const getFilePath = (file) => {
    if (!file) return null;
    return file.path.replace(/\\/g, '/');
};

/**
 * Get multiple file paths
 * @param {array} files - Array of multer file objects
 * @returns {array} - Array of relative file paths
 */
const getFilePaths = (files) => {
    if (!files || files.length === 0) return [];
    return files.map((file) => getFilePath(file));
};

/**
 * Delete file from filesystem
 * @param {string} filePath - Path to file
 */
const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        console.log(`✅ Deleted file: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error deleting file ${filePath}:`, error.message);
    }
};

/**
 * Delete multiple files
 * @param {array} filePaths - Array of file paths
 */
const deleteFiles = async (filePaths) => {
    if (!filePaths || filePaths.length === 0) return;

    const deletePromises = filePaths.map((filePath) => deleteFile(filePath));
    await Promise.all(deletePromises);
};

/**
 * Ensure upload directories exist
 */
const ensureUploadDirs = async () => {
    const dirs = [
        'uploads',
        'uploads/products',
        'uploads/banners',
        'uploads/payments',
        'uploads/categories'
    ];

    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            console.error(`Error creating directory ${dir}:`, error.message);
        }
    }
};

module.exports = {
    getFilePath,
    getFilePaths,
    deleteFile,
    deleteFiles,
    ensureUploadDirs
};
