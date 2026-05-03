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
    // If payload has imageFile, use FormData
    if (payload.imageFile) {
      const formData = new FormData();
      formData.append('image', payload.imageFile, payload.imageFile.name || 'image.jpg');
      formData.append('title', payload.title);
      formData.append('description', payload.description);
      formData.append('eventDate', payload.eventDate);
      formData.append('startTime', payload.startTime);
      formData.append('endTime', payload.endTime);
      formData.append('venueId', payload.venueId);
      formData.append('status', payload.status);
      const res = await apiClient.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    }
    // Otherwise send as JSON
    const res = await apiClient.post('/events', payload);
    return res.data;
  },
  update: async (id, payload) => {
    // If payload has imageFile, use FormData
    if (payload.imageFile) {
      const formData = new FormData();
      formData.append('image', payload.imageFile, payload.imageFile.name || 'image.jpg');
      formData.append('title', payload.title);
      formData.append('description', payload.description);
      formData.append('eventDate', payload.eventDate);
      formData.append('startTime', payload.startTime);
      formData.append('endTime', payload.endTime);
      formData.append('venueId', payload.venueId);
      formData.append('status', payload.status);
      const res = await apiClient.put(`/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    }
    // Otherwise send as JSON
    const res = await apiClient.put(`/events/${id}`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await apiClient.delete(`/events/${id}`);
    return res.data;
  },
};
