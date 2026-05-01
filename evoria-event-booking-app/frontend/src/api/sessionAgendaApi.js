import { apiClient } from './apiClient';

export const sessionAgendaApi = {
  getAll: async () => {
    const res = await apiClient.get('/session-agendas');
    return res.data;
  },
  getByEvent: async (eventId) => {
    const res = await apiClient.get(`/session-agendas/event/${eventId}`);
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/session-agendas/${id}`);
    return res.data;
  },
  create: async (payload) => {
    const res = await apiClient.post('/session-agendas', payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await apiClient.put(`/session-agendas/${id}`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await apiClient.delete(`/session-agendas/${id}`);
    return res.data;
  },
};
