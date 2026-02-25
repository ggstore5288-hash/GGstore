import client from './client';

const productsAPI = {
    // Get products with filters
    getProducts: async (filters = {}) => {
        const params = new URLSearchParams();

        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';

        const response = await client.get(endpoint);
        return response.data.data;
    },

    // Get product by ID
    getProductById: async (id) => {
        const response = await client.get(`/products/${id}`);
        return response.data.data.product;
    },

    // Create product (Admin)
    createProduct: async (productData) => {
        const formData = new FormData();

        // Add text fields
        Object.keys(productData).forEach(key => {
            if (key !== 'images' && key !== 'bannerImages' && productData[key] !== undefined) {
                formData.append(key, productData[key]);
            }
        });

        // Add images
        if (productData.images && productData.images.length > 0) {
            productData.images.forEach(image => {
                formData.append('images', image);
            });
        }

        // Add banner images
        if (productData.bannerImages && productData.bannerImages.length > 0) {
            productData.bannerImages.forEach(image => {
                formData.append('bannerImages', image);
            });
        }

        const response = await client.post('/products', formData, true);
        return response.data.data.product;
    },

    // Update product (Admin)
    updateProduct: async (id, productData) => {
        const formData = new FormData();

        // Add text fields
        Object.keys(productData).forEach(key => {
            if (key !== 'images' && key !== 'bannerImages' && productData[key] !== undefined) {
                formData.append(key, productData[key]);
            }
        });

        // Add new images if any
        if (productData.images && productData.images.length > 0) {
            productData.images.forEach(image => {
                if (image instanceof File) {
                    formData.append('images', image);
                }
            });
        }

        // Add new banner images if any
        if (productData.bannerImages && productData.bannerImages.length > 0) {
            productData.bannerImages.forEach(image => {
                if (image instanceof File) {
                    formData.append('bannerImages', image);
                }
            });
        }

        const response = await client.put(`/products/${id}`, formData, true);
        return response.data.data.product;
    },

    // Delete product (Admin)
    deleteProduct: async (id) => {
        const response = await client.delete(`/products/${id}`);
        return response;
    },

    // Toggle product status (Admin)
    toggleProductStatus: async (id) => {
        const response = await client.patch(`/products/${id}/toggle`);
        return response.data.data.product;
    }
};

export default productsAPI;
