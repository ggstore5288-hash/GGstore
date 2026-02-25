import client from './client';

const contentAPI = {
    // Get banners
    getBanners: async (position = null) => {
        const endpoint = position ? `/content/banners?position=${position}&active=true` : '/content/banners?active=true';
        const response = await client.get(endpoint);
        return response.data.banners;
    },

    // Get featured products
    getFeaturedProducts: async (section = null) => {
        const endpoint = section ? `/content/featured?section=${section}&active=true` : '/content/featured?active=true';
        const response = await client.get(endpoint);
        return response.data.featuredProducts;
    },

    // Create banner (Admin)
    createBanner: async (bannerData) => {
        const formData = new FormData();
        formData.append('title', bannerData.title);
        if (bannerData.link) {
            formData.append('link', bannerData.link);
        }
        formData.append('position', bannerData.position || 'homepage');
        formData.append('order', bannerData.order || 0);
        formData.append('bannerImage', bannerData.image);

        const response = await client.post('/content/banners', formData, true);
        return response.data.banner;
    },

    // Update banner (Admin)
    updateBanner: async (id, bannerData) => {
        const formData = new FormData();

        if (bannerData.title) {
            formData.append('title', bannerData.title);
        }
        if (bannerData.link !== undefined) {
            formData.append('link', bannerData.link);
        }
        if (bannerData.position) {
            formData.append('position', bannerData.position);
        }
        if (bannerData.order !== undefined) {
            formData.append('order', bannerData.order);
        }
        if (bannerData.isActive !== undefined) {
            formData.append('isActive', bannerData.isActive);
        }
        if (bannerData.image instanceof File) {
            formData.append('bannerImage', bannerData.image);
        }

        const response = await client.put(`/content/banners/${id}`, formData, true);
        return response.data.banner;
    },

    // Delete banner (Admin)
    deleteBanner: async (id) => {
        const response = await client.delete(`/content/banners/${id}`);
        return response;
    },

    // Add featured product (Admin)
    addFeaturedProduct: async (productId, section, order = 0) => {
        const response = await client.post('/content/featured', {
            productId,
            section,
            order
        });
        return response.data.featuredProduct;
    },

    // Update featured product (Admin)
    updateFeaturedProduct: async (id, data) => {
        const response = await client.put(`/content/featured/${id}`, data);
        return response.data.featuredProduct;
    },

    // Remove featured product (Admin)
    removeFeaturedProduct: async (id) => {
        const response = await client.delete(`/content/featured/${id}`);
        return response;
    }
};

export default contentAPI;
