import { apiClient } from './apiClient';

export const notificationApi = {
  getMyNotifications: async () => {
    const res = await apiClient.get('/notifications/my');
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await apiClient.get('/notifications/unread-count');
    return res.data;
  },
  markNotificationAsRead: async (id) => {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsAsRead: async () => {
    const res = await apiClient.put('/notifications/mark-all-read');
    return res.data;
  },
  deleteNotification: async (id) => {
    const res = await apiClient.delete(`/notifications/${id}`);
    return res.data;
  },
};