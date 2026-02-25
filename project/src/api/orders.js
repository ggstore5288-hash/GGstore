import client from './client';

const ordersAPI = {
    // Create order from cart
    createOrder: async (phone, paymentMethod) => {
        const response = await client.post('/orders', {
            phone,
            paymentMethod
        });
        return response.data.order;
    },

    // Get user's orders
    getOrders: async (page = 1, limit = 10) => {
        const response = await client.get(`/orders?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Get order by ID
    getOrderById: async (id) => {
        const response = await client.get(`/orders/${id}`);
        return response.data.order;
    },

    // Cancel order
    cancelOrder: async (id) => {
        const response = await client.patch(`/orders/${id}/cancel`);
        return response.data.order;
    },

    // Get all orders (Admin)
    getAllOrders: async (filters = {}) => {
        const params = new URLSearchParams();

        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/orders/admin/all?${queryString}` : '/orders/admin/all';

        const response = await client.get(endpoint);
        return response.data;
    },

    // Update order status (Admin)
    updateOrderStatus: async (id, status) => {
        const response = await client.patch(`/orders/${id}/status`, {
            status
        });
        return response.data.order;
    }
};

export default ordersAPI;
