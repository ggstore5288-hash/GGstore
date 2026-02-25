// Application Constants

// User Roles
const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};

// Product Types
const PRODUCT_TYPES = {
    GAME: 'game',
    GIFT_CARD: 'gift_card',
    SUBSCRIPTION: 'subscription',
    SOFTWARE: 'software'
};

// Product Platforms
const PLATFORMS = {
    STEAM: 'Steam',
    PLAYSTATION: 'PlayStation',
    XBOX: 'Xbox',
    NINTENDO: 'Nintendo',
    PC: 'PC',
    MOBILE: 'Mobile',
    SOFTWARE: 'Software'
};

// Product Regions
const REGIONS = {
    GLOBAL: 'Global',
    EGYPT: 'Egypt',
    USA: 'USA',
    EU: 'EU',
    MENA: 'MENA',
    ASIA: 'Asia',
    MIDDLE_EAST: 'Middle East',
    EUROPE: 'Europe',
    TURKEY: 'Turkey',
    SAUDI_ARABIA: 'Saudi Arabia',
    UAE: 'UAE',
    KUWAIT: 'Kuwait',
    QATAR: 'Qatar',
    BAHRAIN: 'Bahrain',
    OMAN: 'Oman',
    JORDAN: 'Jordan',
    LEBANON: 'Lebanon',
    IRAQ: 'Iraq',
    LATAM: 'Latam',
    BRAZIL: 'Brazil',
    ARGENTINA: 'Argentina',
    NORTH_AMERICA: 'North America',
    SOUTH_AMERICA: 'South America',
    AFRICA: 'Africa',
    AUSTRALIA: 'Australia'
};

// Payment Methods
const PAYMENT_METHODS = {
    INSTAPAY: 'InstaPay',
    TELDA: 'Telda',
    VODAFONE_CASH: 'Vodafone Cash'
};

// Payment Status
const PAYMENT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected'
};

// Order Status
const ORDER_STATUS = {
    NEW: 'new',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

// Discount Types
const DISCOUNT_TYPES = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed'
};

// Banner Positions
const BANNER_POSITIONS = {
    HOMEPAGE: 'homepage',
    CATEGORY: 'category',
    PRODUCT: 'product'
};

// Featured Product Sections
const FEATURED_SECTIONS = {
    FEATURED: 'featured',
    DISCOUNTED: 'discounted',
    NEW_ARRIVALS: 'new_arrivals',
    BEST_SELLERS: 'best_sellers'
};

// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
};

module.exports = {
    USER_ROLES,
    PRODUCT_TYPES,
    PLATFORMS,
    REGIONS,
    PAYMENT_METHODS,
    PAYMENT_STATUS,
    ORDER_STATUS,
    DISCOUNT_TYPES,
    BANNER_POSITIONS,
    FEATURED_SECTIONS,
    HTTP_STATUS
};
