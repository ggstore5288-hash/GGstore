const multer = require('multer');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Use disk storage temporarily (avoids BSON version conflict with multer-gridfs-storage)
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tmpDir = path.join(__dirname, '../../uploads/tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) return cb(err);
            const filename = buf.toString('hex') + path.extname(file.originalname);
            cb(null, filename);
        });
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: diskStorage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

/**
 * Stream a temp file into GridFS, then clean up temp file.
 */
const streamToGridFS = (filePath, filename, mimetype) => {
    return new Promise((resolve, reject) => {
        const db = mongoose.connection.db;
        if (!db) {
            return reject(new Error('Database not ready'));
        }

        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
        const readStream = fs.createReadStream(filePath);
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: mimetype
        });

        readStream.pipe(uploadStream);

        uploadStream.on('finish', () => {
            // Clean up temp file
            fs.unlink(filePath, (err) => {
                if (err) console.warn('Could not delete temp file:', err.message);
            });
            resolve(filename);
        });

        uploadStream.on('error', (err) => {
            fs.unlink(filePath, () => { }); // try cleanup
            reject(err);
        });
    });
};

// Helper to construct image URL
const getImageUrl = (req, filename) => {
    // Force HTTPS in production
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
    const host = process.env.NODE_ENV === 'production'
        ? 'ggstore-zjau.onrender.com'
        : req.get('host');
    return `${protocol}://${host}/api/images/${filename}`;
};

// Middleware for single file upload
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        const uploadMiddleware = upload.single(fieldName);
        uploadMiddleware(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: `Upload error: ${err.message}` });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }
            // If a file was uploaded, stream it to GridFS
            if (req.file) {
                try {
                    const gridFilename = await streamToGridFS(
                        req.file.path,
                        req.file.filename,
                        req.file.mimetype
                    );
                    req.file.gridFilename = gridFilename;
                } catch (gridErr) {
                    return res.status(500).json({ message: `GridFS upload failed: ${gridErr.message}` });
                }
            }
            next();
        });
    };
};

// Middleware for multiple fields
const uploadFields = (fields) => {
    return (req, res, next) => {
        const uploadMiddleware = upload.fields(fields);
        uploadMiddleware(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: `Upload error: ${err.message}` });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }
            // Stream all files to GridFS
            if (req.files) {
                try {
                    for (const key of Object.keys(req.files)) {
                        for (const file of req.files[key]) {
                            const gridFilename = await streamToGridFS(file.path, file.filename, file.mimetype);
                            file.gridFilename = gridFilename;
                        }
                    }
                } catch (gridErr) {
                    return res.status(500).json({ message: `GridFS upload failed: ${gridErr.message}` });
                }
            }
            next();
        });
    };
};

// Middleware to process uploaded images (map filename to URL)
const processUploadedImages = async (req, res, next) => {
    if (!req.files && !req.file) return next();

    req.uploadedImages = {};

    if (req.files) {
        Object.keys(req.files).forEach(key => {
            req.uploadedImages[key] = req.files[key].map(file =>
                getImageUrl(req, file.gridFilename || file.filename)
            );
        });
    } else if (req.file) {
        req.uploadedImages[req.file.fieldname] = getImageUrl(
            req,
            req.file.gridFilename || req.file.filename
        );
    }

    next();
};

module.exports = {
    uploadSingle,
    uploadFields,
    processUploadedImages
};
