import axios from 'axios';

const getBaseUrl = () => {
    // 1. Check for manual override in environment
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && !envUrl.includes('localhost')) {
        const normalized = envUrl.replace(/\/$/, '');
        return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
    }

    // 2. Check if we are running on a production domain (like Vercel)
    const isProductionDomain = typeof window !== 'undefined' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';

    if (isProductionDomain || import.meta.env.PROD) {
        return 'https://ggstore-zjau.onrender.com/api';
    }

    // 3. Fallback to localhost for development
    return (envUrl || 'http://localhost:5000/api').replace(/\/$/, '');
};

const API_URL = getBaseUrl();
if (typeof window !== 'undefined') {
    console.log('📡 [API] Base URL:', API_URL);
}

// Create axios instance
const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Important for cookies (refreshToken and CSRF)
});

// CSRF token storage
let csrfToken = null;

// Helper to get CSRF token from cookie
const getCsrfTokenFromCookie = () => {
    const name = 'csrf-token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
};

// Helper to fetch CSRF token from backend
const fetchCsrfToken = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/auth/csrf-token`,
            { withCredentials: true }
        );

        // Try to get token from response header, response data, or cookie
        const tokenFromHeader = response.headers['x-csrf-token'];
        const tokenFromData = response.data?.data?.token;
        const tokenFromCookie = getCsrfTokenFromCookie();

        csrfToken = tokenFromHeader || tokenFromData || tokenFromCookie;
        return csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        return null;
    }
};

// Initialize CSRF token
const initializeCsrf = async () => {
    // First try to get from cookie
    csrfToken = getCsrfTokenFromCookie();

    // If not in cookie, fetch from backend
    if (!csrfToken) {
        await fetchCsrfToken();
    }
};

// Helper to set auth token
const setAuthToken = (token) => {
    if (token) {
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
    } else {
        delete client.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
};

// Helper to get auth token
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Helper to remove auth token
const removeAuthToken = () => {
    delete client.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
};

// Initialize token from storage
const token = getAuthToken();
if (token) {
    setAuthToken(token);
}

// Request interceptor
client.interceptors.request.use(
    async (config) => {
        // Add auth token
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Add CSRF token for state-changing requests
        if (['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
            // Try to get fresh token from cookie first
            const tokenFromCookie = getCsrfTokenFromCookie();
            if (tokenFromCookie) {
                csrfToken = tokenFromCookie;
            }

            // If no token, fetch a new one
            if (!csrfToken) {
                await fetchCsrfToken();
            }

            if (csrfToken) {
                config.headers['X-CSRF-Token'] = csrfToken;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
client.interceptors.response.use(
    (response) => {
        // Extract new CSRF token from response if available
        const newCsrfToken = response.headers['x-csrf-token'];
        if (newCsrfToken) {
            csrfToken = newCsrfToken;
        } else {
            // Also check cookie
            const tokenFromCookie = getCsrfTokenFromCookie();
            if (tokenFromCookie) {
                csrfToken = tokenFromCookie;
            }
        }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 403 Forbidden (CSRF token issues)
        if (error.response && error.response.status === 403 && !originalRequest._retrycsrf) {
            originalRequest._retrycsrf = true;

            // Fetch new CSRF token and retry
            await fetchCsrfToken();
            if (csrfToken) {
                originalRequest.headers['X-CSRF-Token'] = csrfToken;
                return client(originalRequest);
            }
        }

        // Handle 401 Unauthorized (Token expired)
        // Guard: do NOT retry if the failing request is any auth endpoint
        // (login/signup failures are real 401s, not expired tokens — refreshing would cause a redirect loop)
        const isAuthRequest = originalRequest.url?.includes('/auth/');
        if (error.response && error.response.status === 401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                // Note: This endpoint should set the new cookie and return the new access token
                const response = await client.post('/auth/refresh-token');

                if (response.data && response.data.accessToken) {
                    const { accessToken } = response.data;
                    setAuthToken(accessToken);
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return client(originalRequest);
                }
            } catch (err) {
                // Refresh failed - logout user
                removeAuthToken();
                csrfToken = null;
                // Optional: Redirect to login or emit logout event
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }

        if (error.response && error.response.data) {
            const data = error.response.data;
            error.message = data.message || data.error || error.message;
        }

        return Promise.reject(error);
    }
);

// Attach helpers to client instance
client.setAuthToken = setAuthToken;
client.getAuthToken = getAuthToken;
client.removeAuthToken = removeAuthToken;
client.initializeCsrf = initializeCsrf;

export default client;
