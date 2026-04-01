/**
 * Utility to convert various cloud storage share links to direct image URLs.
 * This improves performance by avoiding extra redirects and allowing
 * browsers to cache images more effectively.
 */

export const convertToDirectLink = (url) => {
    if (!url || typeof url !== 'string') return url;

    const trimmedUrl = url.trim();

    // 1. Handle Google Drive Share Links
    // Link: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // Direct: https://lh3.googleusercontent.com/d/FILE_ID
    // (Alternative: https://drive.google.com/uc?export=view&id=FILE_ID)
    const driveMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                       trimmedUrl.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/) ||
                       trimmedUrl.match(/docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);

    if (driveMatch && driveMatch[1]) {
        // Use the high-performance lh3 googleusercontent link which is faster and supports more formats
        return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }

    // 2. Handle Dropbox Links
    // Link: https://www.dropbox.com/s/ID/name.jpg?dl=0
    // Direct: https://dl.dropboxusercontent.com/s/ID/name.jpg
    if (trimmedUrl.includes('dropbox.com')) {
        return trimmedUrl
            .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
            .replace(/\?dl=0$/, '');
    }

    // 3. Handle Discord Image Links (Note: These often have short TTLs now)
    // No specific conversion needed, but useful as a placeholder.

    // 4. Return original if no conversion matches
    return trimmedUrl;
};

/**
 * Validates if a string is a valid URL
 */
export const isValidUrl = (url) => {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
};
