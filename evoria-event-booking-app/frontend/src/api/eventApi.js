import { apiClient } from './apiClient';

const appendImageFile = (formData, imageFile) => {
  if (!imageFile) return;
  formData.append('image', {
    uri: imageFile.uri,
    name: imageFile.name || 'image.jpg',
    type: imageFile.type || 'image/jpeg',
  });
};

export const eventApi = {
  getAll: async () => {
    const res = await apiClient.get('/events');
    return res.data;
  },
  getAllAdmin: async () => {
    const res = await apiClient.get('/events/admin/all');
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/events/${id}`);
    return res.data;
  },
  create: async (payload) => {
    if (payload.imageFile) {
      const formData = new FormData();
      appendImageFile(formData, payload.imageFile);
      formData.append('title', payload.title);
      formData.append('description', payload.description);
      formData.append('eventDate', payload.eventDate);
      formData.append('startTime', payload.startTime);
      formData.append('endTime', payload.endTime);
      formData.append('venueId', payload.venueId);
      formData.append('category', payload.category || '');
      formData.append('status', payload.status);
      const res = await apiClient.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    }
    const res = await apiClient.post('/events', payload);
    return res.data;
  },
  update: async (id, payload) => {
    if (payload.imageFile) {
      const formData = new FormData();
      appendImageFile(formData, payload.imageFile);
      formData.append('title', payload.title);
      formData.append('description', payload.description);
      formData.append('eventDate', payload.eventDate);
      formData.append('startTime', payload.startTime);
      formData.append('endTime', payload.endTime);
      formData.append('venueId', payload.venueId);
      formData.append('category', payload.category || '');
      formData.append('status', payload.status);
      const res = await apiClient.put(`/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    }
    const res = await apiClient.put(`/events/${id}`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await apiClient.delete(`/events/${id}`);
    return res.data;
  },
};
