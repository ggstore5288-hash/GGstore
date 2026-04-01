/**
 * Environment variable validation configuration
 */
const REQUIRED_VARS = [
    'MONGO_URI',
    'JWT_SECRET',
    'EMAIL_FROM'
];

const DEFAULT_CONFIG = {
    NODE_ENV: 'development',
    PORT: 5000,
    JWT_EXPIRE: '15m',
    EMAIL_FROM_NAME: 'Gaming Store',
    FRONTEND_URL: 'http://localhost:3000',
    MAX_FILE_SIZE: 5242880, // 5MB
    UPLOAD_PATH: './uploads'
};

/**
 * Validate environment variables manually to remove dependency on 'joi'
 */
const validateEnv = () => {
    const missing = [];
    const config = { ...DEFAULT_CONFIG };

    // Set variables from process.env
    Object.keys(process.env).forEach(key => {
        config[key] = process.env[key];
    });

    // Check required variables
    REQUIRED_VARS.forEach(key => {
        if (!process.env[key]) {
            missing.push(key);
        }
    });

    if (missing.length > 0) {
        console.error('❌ Environment variable validation failed:\n');
        missing.forEach(key => console.error(`  - ${key}: is required but missing`));
        console.error('\nPlease check your .env file and ensure all required variables are set correctly.\n');
        process.exit(1);
    }

    // Additional type/logic checks
    if (config.PORT) config.PORT = parseInt(config.PORT, 10);
    if (config.MAX_FILE_SIZE) config.MAX_FILE_SIZE = parseInt(config.MAX_FILE_SIZE, 10);

    if (isNaN(config.PORT)) {
        console.error('❌ PORT must be a number');
        process.exit(1);
    }

    if (config.JWT_SECRET && config.JWT_SECRET.length < 32 && config.NODE_ENV === 'production') {
        process.emitWarning('JWT_SECRET should be at least 32 characters long for security in production.');
    }

    // SMTP specific checks if EMAIL_SERVICE is provided
    if (config.EMAIL_SERVICE === 'custom') {
        const smtpRequired = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'];
        smtpRequired.forEach(key => {
            if (!process.env[key]) {
                console.error(`❌ ${key} is required when EMAIL_SERVICE is 'custom'`);
                process.exit(1);
            }
        });
    }

    // Log validated configuration (without sensitive data)
    console.log('✅ Environment variables validated successfully');
    console.log(`   NODE_ENV: ${config.NODE_ENV}`);
    console.log(`   PORT: ${config.PORT}`);
    console.log(`   MONGO_URI: ${config.MONGO_URI ? '✓ Set' : '✗ Missing'}`);
    console.log(`   JWT_SECRET: ${config.JWT_SECRET ? '✓ Set' : '✗ Missing'}`);
    console.log(`   EMAIL_FROM: ${config.EMAIL_FROM || '✗ Missing'}`);
    console.log(`   FRONTEND_URL: ${config.FRONTEND_URL}`);

    return config;
};

module.exports = validateEnv;

