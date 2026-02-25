const Joi = require('joi');

/**
 * Environment variable validation schema
 */
const envSchema = Joi.object({
    // Server Configuration
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number()
        .integer()
        .min(1)
        .max(65535)
        .default(5000),

    // MongoDB Configuration
    MONGO_URI: Joi.string()
        .required()
        .messages({
            'any.required': 'MONGO_URI is required',
            'string.empty': 'MONGO_URI cannot be empty'
        }),

    // JWT Configuration
    JWT_SECRET: Joi.string()
        .min(32)
        .required()
        .messages({
            'any.required': 'JWT_SECRET is required',
            'string.min': 'JWT_SECRET must be at least 32 characters long for security'
        }),
    JWT_EXPIRE: Joi.string()
        .default('15m'),

    // Email Configuration
    EMAIL_SERVICE: Joi.string()
        .optional(),
    EMAIL_USER: Joi.string()
        .email()
        .when('EMAIL_SERVICE', {
            is: Joi.exist(),
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
    EMAIL_PASSWORD: Joi.string()
        .when('EMAIL_SERVICE', {
            is: Joi.exist(),
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
    SMTP_HOST: Joi.string()
        .when('EMAIL_SERVICE', {
            is: Joi.string().valid('custom'),
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
    SMTP_PORT: Joi.number()
        .integer()
        .min(1)
        .max(65535)
        .when('EMAIL_SERVICE', {
            is: Joi.string().valid('custom'),
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
    SMTP_USER: Joi.string()
        .when('EMAIL_SERVICE', {
            is: Joi.string().valid('custom'),
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
    SMTP_PASSWORD: Joi.string()
        .when('EMAIL_SERVICE', {
            is: Joi.string().valid('custom'),
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
    EMAIL_FROM: Joi.string()
        .email()
        .required()
        .messages({
            'any.required': 'EMAIL_FROM is required'
        }),
    EMAIL_FROM_NAME: Joi.string()
        .default('Gaming Store'),

    // Admin Configuration
    ADMIN_EMAIL: Joi.string()
        .email()
        .optional(),
    ADMIN_PASSWORD: Joi.string()
        .min(8)
        .optional(),
    ADMIN_NAME: Joi.string()
        .optional(),
    ADMIN_PHONE: Joi.string()
        .optional(),

    // Frontend Configuration
    FRONTEND_URL: Joi.string()
        .uri()
        .default('http://localhost:3000'),

    // File Upload Configuration
    MAX_FILE_SIZE: Joi.number()
        .integer()
        .min(1024) // 1KB minimum
        .default(5242880), // 5MB default
    UPLOAD_PATH: Joi.string()
        .default('./uploads')
}).unknown(true); // Allow system environment variables

/**
 * Validate environment variables
 */
const validateEnv = () => {
    const { error, value } = envSchema.validate(process.env, {
        abortEarly: false, // Collect all errors
        stripUnknown: true // Remove unknown variables
    });

    if (error) {
        const errorMessages = error.details.map(detail => {
            return `  - ${detail.path.join('.')}: ${detail.message}`;
        }).join('\n');

        console.error('❌ Environment variable validation failed:\n');
        console.error(errorMessages);
        console.error('\nPlease check your .env file and ensure all required variables are set correctly.\n');
        process.exit(1);
    }

    // Log validated configuration (without sensitive data)
    console.log('✅ Environment variables validated successfully');
    console.log(`   NODE_ENV: ${value.NODE_ENV}`);
    console.log(`   PORT: ${value.PORT}`);
    console.log(`   MONGO_URI: ${value.MONGO_URI ? '✓ Set' : '✗ Missing'}`);
    console.log(`   JWT_SECRET: ${value.JWT_SECRET ? '✓ Set' : '✗ Missing'}`);
    console.log(`   EMAIL_FROM: ${value.EMAIL_FROM || '✗ Missing'}`);
    console.log(`   FRONTEND_URL: ${value.FRONTEND_URL}`);

    return value;
};

module.exports = validateEnv;
