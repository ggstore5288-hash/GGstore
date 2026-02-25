import client from './client';

const paymentsAPI = {
    // Submit payment with proof
    submitPayment: async (orderId, paymentMethod, phoneNumber, proofImage) => {
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('paymentMethod', paymentMethod);
        formData.append('phoneNumber', phoneNumber);
        formData.append('proofImage', proofImage);

        const response = await client.post('/payments', formData, true);
        return response.data.payment;
    },

    // Get payment status
    getPaymentStatus: async (orderId) => {
        const response = await client.get(`/payments/${orderId}`);
        return response.data.payment;
    },

    // Get all payments (Admin)
    getAllPayments: async (filters = {}) => {
        const params = new URLSearchParams();

        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/payments?${queryString}` : '/payments';

        const response = await client.get(endpoint);
        return response.data;
    },

    // Confirm payment (Admin)
    confirmPayment: async (id) => {
        const response = await client.patch(`/payments/${id}/confirm`);
        return response.data.payment;
    },

    // Reject payment (Admin)
    rejectPayment: async (id, reason) => {
        const response = await client.patch(`/payments/${id}/reject`, {
            reason
        });
        return response.data.payment;
    }
};

export default paymentsAPI;
