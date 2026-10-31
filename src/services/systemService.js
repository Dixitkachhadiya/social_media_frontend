import api from './api';

// GET /api/health and GET /api/db-status (used only for the connection indicator)
export const systemService = {
  health: () => api.get('/health').then((res) => res.data),
  dbStatus: () => api.get('/db-status').then((res) => res.data),
};
