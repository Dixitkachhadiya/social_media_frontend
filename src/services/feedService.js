import api from './api';

// GET /api/feed?page&limit&sort=latest|popular
export const feedService = {
  getFeed: ({ page = 1, limit = 10, sort = 'latest' } = {}) =>
    api.get('/feed', { params: { page, limit, sort } }).then((res) => res.data),
};
