import api from './api';

export const notificationService = {
  list: ({ page = 1, limit = 20, unread = false } = {}) =>
    api.get('/notifications', { params: { page, limit, ...(unread && { unread: true }) } }).then((res) => res.data),
  unreadCount: () => api.get('/notifications/unread-count').then((res) => res.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllRead: () => api.patch('/notifications/read-all').then((res) => res.data),
  remove: (id) => api.delete(`/notifications/${id}`).then((res) => res.data),
};
