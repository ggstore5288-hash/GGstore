import client from './client';

const adminAPI = {
    // Stats & Analytics
    getStats: async (period = 'month') => {
        const response = await client.get('/admin/stats', { params: { period } });
        return response.data.data;
    },

    getAuditLogs: async (params = {}) => {
        const response = await client.get('/admin/audit-logs', { params });
        return response.data.data;
    },

    getAnalytics: async (period = 30) => {
        const response = await client.get('/admin/analytics', { params: { period } });
        return response.data;
    },

    getRecentOrders: async (limit = 5) => {
        // Using the admin/all endpoint but limiting logic might need to be query based or filtered
        const response = await client.get('/orders/admin/all', { params: { limit, page: 1 } });
        // Backend returns { orders, pagination }
        return response.data.data.orders ? response.data.data.orders.slice(0, limit) : [];
    },

    // Products
    getProducts: async (page = 1, limit = 10, search = '') => {
        const params = { page, limit };
        if (search) params.search = search;
        const response = await client.get('/products', { params });
        // Public endpoint returns { products, pages, page, total } directly in data.data or root
        return response.data.data || response.data;
    },

    createProduct: async (productData) => {
        const response = await client.post('/products', productData, {
            headers: { 'Content-Type': undefined } // Let browser set multipart/form-data with boundary
        });
        return response.data.data;
    },

    updateProduct: async (id, productData) => {
        const response = await client.put(`/products/${id}`, productData, {
            headers: { 'Content-Type': undefined }
        });
        return response.data.data;
    },

    deleteProduct: async (id) => {
        const response = await client.delete(`/products/${id}`);
        return response.data;
    },

    getProductById: async (id) => {
        const response = await client.get(`/products/${id}/admin`);
        return response.data.data;
    },

    // Orders
    getOrders: async (page = 1, limit = 10, status = '', paymentStatus = '') => {
        const params = { page, limit };
        if (status && status !== 'all') params.status = status;
        if (paymentStatus) params.paymentStatus = paymentStatus;

        const response = await client.get('/orders/admin/all', { params });
        return response.data.data;
    },

    getOrderStats: async (days = 30) => {
        const response = await client.get('/orders/admin/stats', { params: { days } });
        return response.data.data;
    },

    updateOrderStatus: async (id, status, message) => {
        const response = await client.patch(`/orders/${id}/status`, { status, message });
        return response.data.data;
    },

    updateEstimatedDelivery: async (id, date) => {
        const response = await client.patch(`/orders/${id}/delivery`, { estimatedDelivery: date });
        return response.data.data;
    },

    // Users
    getUsers: async (page = 1, limit = 10, role = '') => {
        const params = { page, limit };
        if (role) params.role = role;
        const response = await client.get('/users', { params });
        return response.data.data;
    },

    getUserById: async (id) => {
        const response = await client.get(`/users/${id}`);
        return response.data.data;
    },

    updateUser: async (id, userData) => {
        const response = await client.put(`/users/${id}`, userData);
        return response.data.data;
    },

    updateUserRole: async (id, role) => {
        const response = await client.put(`/users/${id}/role`, { role });
        return response.data.data;
    },

    deleteUser: async (id) => {
        const response = await client.delete(`/users/${id}`);
        return response.data;
    },

    bulkUpdateUsers: async (data) => {
        const response = await client.post('/users/bulk', data);
        return response.data;
    },

    // Categories
    getCategories: async (params = {}) => {
        // Public endpoint
        const response = await client.get('/categories', { params });
        return response.data.data.categories;
    },

    createCategory: async (categoryData) => {
        const response = await client.post('/categories', categoryData, {
            headers: { 'Content-Type': undefined }
        });
        return response.data.data;
    },

    updateCategory: async (id, categoryData) => {
        const response = await client.put(`/categories/${id}`, categoryData, {
            headers: { 'Content-Type': undefined }
        });
        return response.data.data;
    },

    deleteCategory: async (id) => {
        const response = await client.delete(`/categories/${id}`);
        return response.data;
    },

    toggleCategoryStatus: async (id) => {
        const response = await client.patch(`/categories/${id}/toggle`);
        return response.data.data;
    },

    // Global Settings
    getSettings: async () => {
        const response = await client.get('/admin/settings');
        return response.data.data;
    },

    updateSetting: async (key, value, description, isPublic, category) => {
        const response = await client.put(`/admin/settings/${key}`, { value, description, isPublic, category });
        return response.data;
    },

    updateSettings: async (settings) => {
        // Bulk update not implemented in backend yet
        console.warn("updateSettings bulk not fully implemented in backend");
        return null;
    },

    // Promo Codes
    getPromoCodes: async () => {
        const response = await client.get('/promo-codes');
        return response.data.data;
    },

    getPromoCodeStats: async (id = null) => {
        const url = id ? `/promo-codes/${id}/stats` : '/promo-codes/stats';
        const response = await client.get(url);
        return response.data;
    },

    createPromoCode: async (data) => {
        const response = await client.post('/promo-codes', data);
        return response.data.data;
    },

    updatePromoCode: async (id, data) => {
        const response = await client.put(`/promo-codes/${id}`, data);
        return response.data.data;
    },

    deletePromoCode: async (id) => {
        const response = await client.delete(`/promo-codes/${id}`);
        return response.data;
    },

    togglePromoCode: async (id) => {
        const response = await client.patch(`/promo-codes/${id}/toggle`);
        return response.data.data;
    },

    // Payments
    getAllPayments: async (page = 1, limit = 20, status = '') => {
        const params = { page, limit };
        if (status) params.status = status;
        const response = await client.get('/payments', { params }); // Admin route is /api/payments based on routes file
        return response.data.data;
    },

    confirmPayment: async (id) => {
        const response = await client.patch(`/payments/${id}/confirm`);
        return response.data.data;
    },

    rejectPayment: async (id, reason) => {
        const response = await client.patch(`/payments/${id}/reject`, { reason });
        return response.data.data;
    },

    // Loyalty
    getLoyaltyPoints: async (page = 1, limit = 50, tier, minPoints) => {
        const params = { page, limit };
        if (tier) params.tier = tier;
        if (minPoints) params.minPoints = minPoints;
        const response = await client.get('/loyalty/all', { params });
        return response.data;
    },

    getLeaderboard: async (limit = 10) => {
        const response = await client.get('/loyalty/leaderboard', { params: { limit } });
        return response.data;
    },

    getLoyaltySettings: async () => {
        const response = await client.get('/loyalty/settings');
        return response.data.data.settings;
    },

    updateLoyaltySettings: async (settings) => {
        const response = await client.put('/loyalty/settings', settings);
        return response.data.data.settings;
    },

    adjustLoyaltyPoints: async (userId, points, reason) => {
        const response = await client.post('/loyalty/adjust', { userId, points, reason });
        return response.data.data;
    },

    // Email Queue
    getEmailQueue: async (page = 1, limit = 50, status = '') => {
        const params = { page, limit };
        if (status) params.status = status;
        const response = await client.get('/admin/emails', { params });
        return response.data;
    },

    retryEmails: async () => {
        const response = await client.post('/admin/emails/retry');
        return response.data;
    },

    deleteEmailFromQueue: async (id) => {
        const response = await client.delete(`/admin/emails/${id}`);
        return response.data;
    },

    // Flash Sales
    getFlashSales: async () => {
        const response = await client.get('/flash-sales');
        return response.data;
    },

    createFlashSale: async (data) => {
        const response = await client.post('/flash-sales', data);
        return response.data;
    },

    endFlashSale: async (productId) => {
        const response = await client.delete(`/flash-sales/${productId}`);
        return response.data;
    },

    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await client.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Reviews
    getReviews: async (page = 1, limit = 50, approved = '', rating = '') => {
        const params = { page, limit };
        if (approved !== '') params.approved = approved;
        if (rating !== '') params.rating = rating;
        const response = await client.get('/admin/reviews', { params });
        return response.data;
    },

    moderateReview: async (id, isApproved, showInSlider) => {
        const response = await client.patch(`/admin/reviews/${id}/moderate`, { isApproved, showInSlider });
        return response.data;
    },

    // Newsletter
    getNewsletterSubscribers: async (page = 1, limit = 50) => {
        const response = await client.get('/newsletter/admin/subscribers', { params: { page, limit } });
        return response.data;
    },

    deleteNewsletterSubscriber: async (id) => {
        const response = await client.delete(`/newsletter/admin/subscribers/${id}`);
        return response.data;
    },

    sendNewsletter: async (data) => {
        const response = await client.post('/newsletter/admin/send', data);
        return response.data;
    },

    // Payment Methods
    getAdminPaymentMethods: async () => {
        const response = await client.get('/admin/payment-methods');
        return response.data.data;
    },

    createPaymentMethod: async (data) => {
        const response = await client.post('/admin/payment-methods', data);
        return response.data.data;
    },

    updatePaymentMethod: async (id, data) => {
        const response = await client.put(`/admin/payment-methods/${id}`, data);
        return response.data.data;
    },

    deletePaymentMethod: async (id) => {
        const response = await client.delete(`/admin/payment-methods/${id}`);
        return response.data;
    },

    // ChatBot (Admin)
    getChatBotKnowledge: async () => {
        const response = await client.get('/chatbot/admin/knowledge');
        return response.data;
    },

    upsertChatBotKnowledge: async (data) => {
        const response = await client.post('/chatbot/admin/knowledge', data);
        return response.data;
    },

    deleteChatBotKnowledge: async (id) => {
        const response = await client.delete(`/chatbot/admin/knowledge/${id}`);
        return response.data;
    },

    getChatBotUnanswered: async () => {
        const response = await client.get('/chatbot/admin/unanswered');
        return response.data;
    },

    deleteChatBotUnanswered: async (id) => {
        const response = await client.delete(`/chatbot/admin/unanswered/${id}`);
        return response.data;
    }
};

export const chatbotAPI = {
    query: async (query) => {
        const response = await client.post('/chatbot/query', { query });
        return response.data;
    }
};

export default adminAPI;

