const mongoose = require('mongoose');
const logger = require('../utils/logger');
const dns = require('dns');

// Force use of Google DNS to fix 'querySrv ECONNREFUSED' issues
dns.setServers(['8.8.8.8', '8.8.4.4']);


/**
 * Connect to MongoDB
 */
/**
 * Connect to MongoDB
 */
const connectDB = async () => {
    try {
        // Connection options
        const options = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000
        };

        logger.info('Attempting MongoDB connection...');
        // Log masked URI for debugging
        const maskedURI = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^:@]{1,})@/, ':****@') : 'UNDEFINED';
        console.log(`Connecting to: ${maskedURI}`);

        const conn = await mongoose.connect(process.env.MONGO_URI, options);

        logger.info('MongoDB Connected', {
            host: conn.connection.host,
            database: conn.connection.name
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error event:', err);
            logger.error('MongoDB connection error', { error: err.message, stack: err.stack });
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination (SIGINT)');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination (SIGTERM)');
            process.exit(0);
        });

    } catch (error) {
        console.error('MongoDB connection failed (console):', error);
        logger.error('MongoDB connection failed', { error: error.message, stack: error.stack });
        process.exit(1);
    }
};

module.exports = connectDB;
