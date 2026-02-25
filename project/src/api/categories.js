import client from './client';

const categoriesAPI = {
    // Get all categories (public)
    getCategories: async (params = {}) => {
        const response = await client.get('/categories', { params });
        return response.data.data.categories;
    },

    // Get category by ID
    getCategoryById: async (id) => {
        const response = await client.get(`/categories/${id}`);
        return response.data.data;
    },

    // Get category by slug
    getCategoryBySlug: async (slug) => {
        const response = await client.get(`/categories/slug/${slug}`);
        return response.data.data;
    },

    // Create category (admin)
    createCategory: async (formData) => {
        const response = await client.post('/categories', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.data;
    },

    // Update category (admin)
    updateCategory: async (id, formData) => {
        const response = await client.put(`/categories/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.data;
    },

    // Delete category (admin)
    deleteCategory: async (id) => {
        const response = await client.delete(`/categories/${id}`);
        return response.data;
    },

    // Toggle category status (admin)
    toggleCategoryStatus: async (id) => {
        const response = await client.patch(`/categories/${id}/toggle`);
        return response.data.data;
    }
};

export default categoriesAPI;
