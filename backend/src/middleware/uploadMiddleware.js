const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');

const mongoose = require('mongoose');

// Create GridFS storage engine
const storage = new GridFsStorage({
    // Wait for the mongoose connection to be established
    db: mongoose.connection.asPromise().then(() => {
        if (!mongoose.connection.db) {
            throw new Error('Database connection established but db object is missing');
        }
        return mongoose.connection.db;
    }),
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads' // Collection name
                };
                resolve(fileInfo);
            });
        });
    }
});

// Event listener for storage connection
storage.on('connection', () => {
    console.log('✅ GridFS Storage connected');
});

storage.on('connectionFailed', (err) => {
    console.error('❌ GridFS Storage connection failed:', err.message);
});

// File filter (same as before)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        const uploadMiddleware = upload.single(fieldName);
        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: `Upload error: ${err.message}` });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    };
};

// Middleware for multiple fields
const uploadFields = (fields) => {
    return (req, res, next) => {
        const uploadMiddleware = upload.fields(fields);
        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: `Upload error: ${err.message}` });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    };
};

// Helper to construct image URL
const getImageUrl = (req, filename) => {
    // In production, we should try to use the public host
    const protocol = req.protocol === 'http' && process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
    const host = req.get('host');

    // If we are on Render, the host might contain localhost internally
    // though trust proxy should fix this.
    return `${protocol}://${host}/api/images/${filename}`;
};

// Middleware to process uploaded images (map filename to URL)
const processUploadedImages = async (req, res, next) => {
    if (!req.files && !req.file) return next();

    req.uploadedImages = {};

    if (req.files) {
        Object.keys(req.files).forEach(key => {
            req.uploadedImages[key] = req.files[key].map(file => getImageUrl(req, file.filename));
        });
    } else if (req.file) {
        req.uploadedImages[req.file.fieldname] = getImageUrl(req, req.file.filename);
    }

    next();
};

module.exports = {
    uploadSingle,
    uploadFields,
    processUploadedImages
};
