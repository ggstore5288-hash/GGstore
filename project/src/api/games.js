import client from './client';

export const gamesApi = {
    getAll: async () => {
        const response = await client.get('/products?active=true');
        return response.data?.data?.products || [];
    },

    getOne: async (id) => {
        const response = await client.get(`/products/${id}`);
        return response.data?.data?.product || null;
    },

    create: async (gameData) => {
        const response = await client.post('/products', gameData);
        return response.data?.data?.product || null;
    },

    update: async (id, gameData) => {
        const response = await client.put(`/products/${id}`, gameData);
        return response.data?.data?.product || null;
    },

    delete: async (id) => {
        const response = await client.delete(`/products/${id}`);
        return response.data || response;
    }
};
