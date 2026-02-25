
export const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/300x400?text=No+Image';

    // If it's already a full URL, return it
    if (path.startsWith('http')) return path;

    // Get backend URL
    const getBaseUrl = () => {
        // 1. Check if we are in a browser environment
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';

        // 2. If NOT local, always use production backend (ignore misconfigured .env)
        if (!isLocal) {
            return 'https://ggstore-zjau.onrender.com';
        }

        // 3. Fallback to env or localhost for development
        const envUrl = import.meta.env.VITE_API_URL;
        const apiUrl = envUrl || 'http://localhost:5000/api';
        return apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    };

    const baseUrl = getBaseUrl();

    // Sanitize path: Remove hardcoded localhost references if they exist
    // (Happens if database contains absolute paths pointing to dev environment)
    let sanitizedPath = path;
    if (sanitizedPath.includes('localhost:5000')) {
        sanitizedPath = sanitizedPath.replace(/http:\/\/localhost:5000\/?(api\/)?/, '');
    }

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
