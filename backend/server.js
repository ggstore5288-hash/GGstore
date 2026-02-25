require('dotenv').config();

// Validate environment variables first
const validateEnv = require('./src/config/env');
validateEnv();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { ensureUploadDirs } = require('./src/services/uploadService');
const { processEmailQueue } = require('./src/services/emailQueueService');
const User = require('./src/models/User');
const { USER_ROLES } = require('./src/utils/constants');

const PORT = process.env.PORT || 5000;

/**
 * Start server
 */
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Ensure upload directories exist
        await ensureUploadDirs();
        console.log('✅ Upload directories ready');

        // Start email queue processor
        processEmailQueue();
        console.log('✅ Email queue processor started');

        // Start server
        const server = app.listen(PORT, () => {
            console.log('');
            console.log('='.repeat(50));
            console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
            console.log(`📡 Port: ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`💚 Health: http://localhost:${PORT}/health`);
            console.log('='.repeat(50));
            console.log('');
        });

        // Handle server errors (e.g., EADDRINUSE)
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use.`);
            } else {
                console.error('❌ Server error:', err.message);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Server startup failed:', error.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection:');
    console.error('  Reason:', reason instanceof Error ? reason.stack : reason);
    // In production, we might want to shut down gracefully
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:');
    console.error('  Error:', err.stack);
    process.exit(1);
});

// Start the server
startServer();
