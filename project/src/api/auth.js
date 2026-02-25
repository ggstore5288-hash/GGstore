import client from './client';

const authAPI = {
    // Signup
    signup: async (name, email, password, phone) => {
        const response = await client.post('/auth/signup', {
            name,
            email,
            password,
            phone
        });
        return response.data.data;
    },

    // Login
    login: async (email, password) => {
        const response = await client.post('/auth/login', {
            email,
            password
        });

        // response.data is body, response.data.data is payload { user, token }
        if (response.data.data && response.data.data.token) {
            client.setAuthToken(response.data.data.token);
        }

        return response.data.data;
    },

    // Verify email
    verifyEmail: async (email, code) => {
        const response = await client.post('/auth/verify-email', {
            email,
            code
        });

        if (response.data.data && response.data.data.token) {
            client.setAuthToken(response.data.data.token);
        }

        return response.data.data;
    },

    // Resend verification code
    resendVerification: async (email) => {
        const response = await client.post('/auth/resend-verification', {
            email
        });
        return response.data;
    },

    // Forgot password - send reset code
    forgotPassword: async (email) => {
        const response = await client.post('/auth/forgot-password', {
            email
        });
        return response.data;
    },

    // Verify reset code
    verifyResetCode: async (email, code) => {
        const response = await client.post('/auth/verify-reset-code', {
            email,
            code
        });
        return response.data;
    },

    // Reset password with code
    resetPassword: async (email, code, newPassword) => {
        const response = await client.post('/auth/reset-password', {
            email,
            code,
            newPassword
        });
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await client.post('/auth/logout');
        return response.data;
    },

    // Token management helpers
    getAuthToken: () => client.getAuthToken(),
    setAuthToken: (token) => client.setAuthToken(token),
    removeAuthToken: () => client.removeAuthToken(),

    // Get current user profile
    getProfile: async () => {
        const response = await client.get('/users/profile');
        return response.data.data.user;
    },

    // Update profile
    updateProfile: async (data) => {
        const response = await client.put('/users/profile', data);
        return response.data.data.user;
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
        const response = await client.put('/users/change-password', {
            currentPassword,
            newPassword
        });
        return response.data;
    }
};

export default authAPI;
