const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { createCSRFToken, verifyCSRFToken } = require('./middleware/csrfMiddleware');
const requestLogger = require('./middleware/requestLogger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const promoCodeRoutes = require('./routes/promoCodeRoutes');
const contentRoutes = require('./routes/contentRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recentlyViewedRoutes = require('./routes/recentlyViewedRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const priceAlertRoutes = require('./routes/priceAlertRoutes');
const flashSaleRoutes = require('./routes/flashSaleRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminProductRoutes = require('./routes/adminProductRoutes');
const auditRoutes = require('./routes/auditRoutes');
const imageRoutes = require('./routes/imageRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const settingsRoutes = require('./routes/settingsRoutes');


// Initialize Express app
const app = express();

// CORS configuration - allow multiple origins
const rawOrigins = [
    process.env.FRONTEND_URL || 'https://g-gstore.vercel.app',
    'http://localhost:5173', // Vite default
    'http://localhost:3000',
    'https://ggstore-zjau.onrender.com' // Frontend deployment on Render
];

// Normalize origins by removing trailing slashes
const allowedOrigins = rawOrigins.map(origin => origin.replace(/\/$/, ''));

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            // Normalize incoming origin for comparison
            const normalizedOrigin = origin.replace(/\/$/, '');

            const isVercel = normalizedOrigin.endsWith('.vercel.app');
            const isAllowed = allowedOrigins.indexOf(normalizedOrigin) !== -1;

            if (isVercel || isAllowed) {
                callback(null, true);
            } else {
                console.warn(`⚠️ CORS BLOCKED: Origin "${origin}" not in allowed list:`, allowedOrigins);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        exposedHeaders: ['X-CSRF-Token']
    })
);

// Security middleware - Enhanced security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    xFrameOptions: { action: 'deny' },
    xContentTypeOptions: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permissionsPolicy: {
        features: {
            geolocation: ["'none'"],
            microphone: ["'none'"],
            camera: ["'none'"]
        }
    }
}));

// Compression middleware
app.use(compression());

// Cookie parser middleware (for refresh tokens)
app.use(cookieParser());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (with request IDs)
app.use(requestLogger);

// Morgan logging (keep for compatibility, but structured logging is primary)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API rate limiting (IP-based for all, user-based for authenticated)
app.use('/api', apiLimiter);

// CSRF protection - Middleware to verify tokens
// We removed createCSRFToken from here because it was regenerating on every request
// and causing synchronization issues. We now fetch it explicitly.

// CSRF verification for state-changing operations
app.use('/api', (req, res, next) => {
    // Skip CSRF for all auth endpoints to prevent chicken-and-egg problem
    // Users need to authenticate first before they can get CSRF tokens
    if (req.path.startsWith('/auth/')) {
        return next();
    }
    return verifyCSRFToken(req, res, next);
});

// Health check route
app.get('/health', async (req, res) => {
    const mongoose = require('mongoose');
    const os = require('os');

    const health = {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        database: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host || 'N/A',
            name: mongoose.connection.name || 'N/A'
        },
        memory: {
            used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
            total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
            unit: 'MB'
        },
        system: {
            platform: os.platform(),
            arch: os.arch(),
            cpuCount: os.cpus().length,
            loadAverage: os.loadavg()
        }
    };

    // Determine overall health status
    if (mongoose.connection.readyState !== 1) {
        health.status = 'degraded';
        health.success = false;
        health.message = 'Database connection issue';
    }

    const statusCode = health.success ? 200 : 503;
    res.status(statusCode).json(health);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/promo-codes', promoCodeRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin/audit-logs', auditRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/price-alerts', priceAlertRoutes);
app.use('/api/flash-sales', flashSaleRoutes);
app.use('/api/compare', comparisonRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/images', imageRoutes); // Mount image routes
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/settings', settingsRoutes);

app.use('/api/upload', require('./routes/uploadRoutes'));

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
