import { apiClient } from './apiClient';

export const userApi = {
  getMe: async () => {
    const res = await apiClient.get('/users/me');
    return res.data;
  },
  updateMe: async (payload) => {
    // Only send the fields the profile screen is allowed to edit.
    const safePayload = {
      name: payload?.name,
      phone: payload?.phone,
    };
    const res = await apiClient.put('/users/me', safePayload);
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
  updateUserStatus: async (id, isActive) => {
    const res = await apiClient.patch(`/users/${id}/status`, { isActive });
    return res.data;
  },
  updateById: async (id, payload) => {
    const res = await apiClient.put(`/users/${id}`, payload);
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
  remove: async (id) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
};
