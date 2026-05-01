import { apiClient } from './apiClient';

export const venueApi = {
  getAll: async () => {
    const res = await apiClient.get('/venues');
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/venues/${id}`);
    return res.data;
  },
  create: async (payload) => {
    // For simplicity in viva/demo, we send image as a URL string.
    // If you want to upload files, use multipart/form-data.
    const res = await apiClient.post('/venues', payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await apiClient.put(`/venues/${id}`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await apiClient.delete(`/venues/${id}`);
    return res.data;
  },
};
