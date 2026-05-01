import { apiClient } from './apiClient';

export const bookingApi = {
  create: async (payload) => {
    const res = await apiClient.post('/bookings', payload);
    return res.data;
  },
  getMy: async () => {
    const res = await apiClient.get('/bookings/my');
    return res.data;
  },
  getAll: async () => {
    const res = await apiClient.get('/bookings');
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/bookings/${id}`);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await apiClient.put(`/bookings/${id}`, payload);
    return res.data;
  },
  confirm: async (id) => {
    const res = await apiClient.put(`/bookings/${id}/confirm`);
    return res.data;
  },
  cancel: async (id) => {
    const res = await apiClient.put(`/bookings/${id}/cancel`);
    return res.data;
  },
  remove: async (id) => {
    const res = await apiClient.delete(`/bookings/${id}`);
    return res.data;
  },
};
