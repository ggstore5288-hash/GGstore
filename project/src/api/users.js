import client from './client';

const usersAPI = {
    // Get all users (Admin)
    getAllUsers: async (filters = {}) => {
        const params = new URLSearchParams();

        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });

        const queryString = params.toString();
        const endpoint = queryString ? `/users?${queryString}` : '/users';

        const response = await client.get(endpoint);
        return response.data;
    },

    // Update user role (Admin)
    updateUserRole: async (id, role) => {
        const response = await client.put(`/users/${id}/role`, {
            role
        });
        return response.data.user;
    }
};

export default usersAPI;
