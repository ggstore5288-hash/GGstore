import client from './client';

export const subscribe = async (email) => {
    const response = await client.post('/newsletter/subscribe', { email });
    return response.data;
};

export const getSubscribers = async (params) => {
    const response = await client.get('/newsletter/admin/subscribers', { params });
    return response.data;
};

export const deleteSubscriber = async (id) => {
    const response = await client.delete(`/newsletter/admin/subscribers/${id}`);
    return response.data;
};

export const sendBulkEmail = async (emailData) => {
    const response = await client.post('/newsletter/admin/send', emailData);
    return response.data;
};
