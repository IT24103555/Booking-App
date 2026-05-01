import { apiClient } from './apiClient';

export const eventApi = {
  getAll: async () => {
    const res = await apiClient.get('/events');
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/events/${id}`);
    return res.data;
  },
  create: async (payload) => {
    const res = await apiClient.post('/events', payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await apiClient.put(`/events/${id}`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await apiClient.delete(`/events/${id}`);
    return res.data;
  },
};
