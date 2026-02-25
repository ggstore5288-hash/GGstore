
export const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/300x400?text=No+Image';

    // If it's already a full URL, return it
    if (path.startsWith('http')) return path;

    // Get backend URL
    const getBaseUrl = () => {
        const envUrl = import.meta.env.VITE_API_URL;
        // If we are in production (Vercel) or the env URL is explicitly production
        const isProduction = (typeof window !== 'undefined' && window.location.hostname !== 'localhost') || import.meta.env.PROD;

        const apiUrl = (isProduction && (!envUrl || !envUrl.includes('localhost')))
            ? 'https://ggstore-zjau.onrender.com/api'
            : (envUrl || 'http://localhost:5000/api');

        return apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    };

    const baseUrl = getBaseUrl();

    // Clean path
    // Remove leading slash if present to avoid double slashes when joining
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Ensure path uses forward slashes
    const normalizedPath = cleanPath.replace(/\\/g, '/');

    // If it's a GridFS image (just a filename) and doesn't have the prefix, add it
    // GridFS images are served via /api/images/
    if (!normalizedPath.startsWith('uploads/') && !normalizedPath.startsWith('api/')) {
        return `${baseUrl}/api/images/${normalizedPath}`;
    }

    return `${baseUrl}/${normalizedPath}`;
};
