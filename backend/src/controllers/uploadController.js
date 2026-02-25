const { HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Upload file
 * @route   POST /api/upload
 * @access  Private
 */
const uploadFile = (req, res, next) => {
    console.log('=== UPLOAD REQUEST ===');
    console.log('File received:', req.file ? 'YES' : 'NO');
    if (req.file) {
        console.log('Filename:', req.file.filename);
        console.log('Size:', req.file.size);
    }

    if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'No file uploaded'
        });
    }

    // For GridFS storage, construct the absolute API path to access the image
    const protocol = req.protocol;
    const host = req.get('host');
    const imagePath = `${protocol}://${host}/api/images/${req.file.filename}`;
    console.log('Returning path:', imagePath);
    console.log('======================');

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
            url: imagePath,
            filename: req.file.filename
        }
    });
};

module.exports = {
    uploadFile
};
