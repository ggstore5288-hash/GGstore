import client from './client';

const promoCodesAPI = {
    // Validate promo code
    validatePromoCode: async (code) => {
        const response = await client.post('/promo-codes/validate', {
            code
        });
        return response.data.promoCode;
    },

    // Get all promo codes (Admin)
    getPromoCodes: async (activeOnly = false) => {
        const endpoint = activeOnly ? '/promo-codes?active=true' : '/promo-codes';
        const response = await client.get(endpoint);
        return response.data.promoCodes;
    },

    // Create promo code (Admin)
    createPromoCode: async (promoCodeData) => {
        const response = await client.post('/promo-codes', promoCodeData);
        return response.data.promoCode;
    },

    // Update promo code (Admin)
    updatePromoCode: async (id, promoCodeData) => {
        const response = await client.put(`/promo-codes/${id}`, promoCodeData);
        return response.data.promoCode;
    },

    // Delete promo code (Admin)
    deletePromoCode: async (id) => {
        const response = await client.delete(`/promo-codes/${id}`);
        return response;
    },

    // Toggle promo code status (Admin)
    togglePromoCodeStatus: async (id) => {
        const response = await client.patch(`/promo-codes/${id}/toggle`);
        return response.data.promoCode;
    }
};

export default promoCodesAPI;
