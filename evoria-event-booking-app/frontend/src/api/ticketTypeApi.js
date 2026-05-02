import { apiClient } from './apiClient';

export const ticketTypeApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get('/ticket-types', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/ticket-types/${id}`);
    return res.data;
  },
  create: async (payload) => {
    const res = await apiClient.post('/ticket-types', payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await apiClient.put(`/ticket-types/${id}`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await apiClient.delete(`/ticket-types/${id}`);
    return res.data;
  },
};
