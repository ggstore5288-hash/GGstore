
export const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/300x400?text=No+Image';

    // If it's already a full URL, return it
    if (path.startsWith('http')) return path;

    // Get backend URL (strip /api if present)
    const rawUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ggstore-zjau.onrender.com/api' : 'http://localhost:5000/api');
    const baseUrl = rawUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

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
