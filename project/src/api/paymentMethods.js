import client from './client';

const paymentMethodAPI = {
    getActiveMethods: async () => {
        const response = await client.get('/payment-methods');
        return response.data.data;
    }
};

export default paymentMethodAPI;
