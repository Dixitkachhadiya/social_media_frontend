import api from './api';

// Drops empty filter values so the backend validators only see real ones
const clean = (params) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value != null));

export const adminService = {
  test: () => api.get('/admin/test').then((res) => res.data),

  // User management
  listUsers: (params = {}) => api.get('/admin/users', { params: clean(params) }).then((res) => res.data),
  getUser: (id) => api.get(`/admin/users/${id}`).then((res) => res.data),
  setUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { is_active: isActive }).then((res) => res.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((res) => res.data),

  // Dashboard
  stats: () => api.get('/admin/dashboard/stats').then((res) => res.data),
  recentActivity: (params = {}) => api.get('/admin/dashboard/recent-activity', { params: clean(params) }).then((res) => res.data),
  recentUsers: (params = {}) => api.get('/admin/dashboard/recent-users', { params: clean(params) }).then((res) => res.data),
  recentPosts: (params = {}) => api.get('/admin/dashboard/recent-posts', { params: clean(params) }).then((res) => res.data),

  // Announcements
  announce: (message) => api.post('/admin/announcements', { message }).then((res) => res.data),
};
