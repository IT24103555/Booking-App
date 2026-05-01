import { apiClient } from './apiClient';

export const userApi = {
  getMe: async () => {
    const res = await apiClient.get('/users/me');
    return res.data;
  },
  updateMe: async (payload) => {
    const res = await apiClient.put('/users/me', payload);
    return res.data;
  },
  getAll: async () => {
    const res = await apiClient.get('/users');
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },
  updateById: async (id, payload) => {
    const res = await apiClient.put(`/users/${id}`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
};
