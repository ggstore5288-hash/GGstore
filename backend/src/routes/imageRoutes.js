const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { HTTP_STATUS } = require('../utils/constants');

let gfs;
let gridfsBucket;

// Init GridFS bucket once connection is open
const conn = mongoose.connection;
conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

/**
 * @route   GET /api/images/:filename
 * @desc    Stream image file
 * @access  Public
 */
router.get('/:filename', async (req, res) => {
    try {
        if (!gridfsBucket) {
            // Try initialization if not ready (rare race condition)
            if (mongoose.connection.readyState === 1) {
                gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                    bucketName: 'uploads'
                });
            } else {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Database parsing error' });
            }
        }

        const filename = req.params.filename;

        // Find file
        const files = await gridfsBucket.find({ filename }).toArray();

        if (!files || files.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'File not found' });
        }

        const file = files[0];

        // Check if image
        if (file.contentType && file.contentType.startsWith('image/')) {
            // Stream response
            res.set('Content-Type', file.contentType);
            const readstream = gridfsBucket.openDownloadStreamByName(filename);
            readstream.pipe(res);
        } else {
            res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Not an image' });
        }
    } catch (error) {
        console.error('Image stream error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
    }
});

module.exports = router;
