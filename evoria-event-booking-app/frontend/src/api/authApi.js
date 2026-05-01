import { apiClient } from './apiClient';

export const authApi = {
  register: async (payload) => {
    const res = await apiClient.post('/auth/register', payload);
    return res.data;
  },
  login: async (payload) => {
    const res = await apiClient.post('/auth/login', payload);
    return res.data;
  },
  me: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};
