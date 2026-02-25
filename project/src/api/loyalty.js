import client from './client';

const loyaltyAPI = {
    // Get user's loyalty points and settings
    getLoyaltyPoints: async () => {
        const response = await client.get('/loyalty');
        return response.data.data;
    }
};

export default loyaltyAPI;
