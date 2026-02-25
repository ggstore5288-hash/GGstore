export const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/300x400?text=No+Image';

    // Detect if we're running locally
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';

    const PRODUCTION_BASE = 'https://ggstore-zjau.onrender.com';

    // --- If it's an absolute URL ---
    if (path.startsWith('http://') || path.startsWith('https://')) {
        // If it's a localhost URL and we're in production, extract just the filename and rewrite it
        if (!isLocal && (path.includes('localhost') || path.includes('127.0.0.1'))) {
            // Extract just the filename from the path
            const parts = path.split('/');
            const filename = parts[parts.length - 1];
            return `${PRODUCTION_BASE}/api/images/${filename}`;
        }
        // Otherwise it's already a correct absolute URL
        return path;
    }

    // --- If it's a relative path ---
    const getBaseUrl = () => {
        if (!isLocal) {
            return PRODUCTION_BASE;
        }
        const envUrl = import.meta.env.VITE_API_URL;
        const apiUrl = envUrl || 'http://localhost:5000/api';
        return apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    };

    const baseUrl = getBaseUrl();

    // Clean path - strip any leading /api/images/ or /uploads/ prefix
    let cleanPath = path
        .replace(/^\/?(api\/images\/)/, '')
        .replace(/^\/?(uploads\/)/, '')
        .replace(/^\//, '');

    // Normalize slashes
    cleanPath = cleanPath.replace(/\\/g, '/');

    // If it's a raw filename with no path prefix, serve it via /api/images/
    if (!cleanPath.includes('/')) {
        return `${baseUrl}/api/images/${cleanPath}`;
    }

    // If it starts with uploads/ serve it as a static file
    if (cleanPath.startsWith('uploads/')) {
        return `${baseUrl}/${cleanPath}`;
    }

    return `${baseUrl}/api/images/${cleanPath}`;
};
