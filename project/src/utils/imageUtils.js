export const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/300x400?text=No+Image';

    // Get environment detection
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';

    // Sanitize path: Remove hardcoded localhost or IP references if they exist
    let sanitizedPath = path;
    if (typeof sanitizedPath === 'string' && !isLocal) {
        // Remove any http://localhost:5000, http://127.0.0.1:5000, etc.
        sanitizedPath = sanitizedPath.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?(api\/)?/, '');

        // Also catch cases where the URL might be just a partial string like /api/images/...
        // or /uploads/...
        if (sanitizedPath.startsWith('api/images/')) {
            sanitizedPath = sanitizedPath.replace('api/images/', '');
        } else if (sanitizedPath.startsWith('/api/images/')) {
            sanitizedPath = sanitizedPath.replace('/api/images/', '');
        }
    }

    // If it's already a full URL (that survived sanitization), return it
    if (sanitizedPath.startsWith('http')) return sanitizedPath;

    // Get backend URL
    const getBaseUrl = () => {
        // 1. If NOT local, always use production backend (ignore misconfigured .env)
        if (!isLocal) {
            return 'https://ggstore-zjau.onrender.com';
        }

        // 2. Fallback to env or localhost for development
        const envUrl = import.meta.env.VITE_API_URL;
        const apiUrl = envUrl || 'http://localhost:5000/api';
        return apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    };

    const baseUrl = getBaseUrl();

    // Clean path
    // Remove leading slash if present to avoid double slashes when joining
    const cleanPath = sanitizedPath.startsWith('/') ? sanitizedPath.slice(1) : sanitizedPath;

    // Ensure path uses forward slashes
    const normalizedPath = cleanPath.replace(/\\/g, '/');

    // If it's a GridFS image (just a filename) and doesn't have the prefix, add it
    if (!normalizedPath.startsWith('uploads/') && !normalizedPath.startsWith('api/')) {
        return `${baseUrl}/api/images/${normalizedPath}`;
    }

    return `${baseUrl}/${normalizedPath}`;
};
