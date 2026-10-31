import api from './api';

export const likeService = {
  like: (postId) => api.post(`/posts/${postId}/like`).then((res) => res.data),
  unlike: (postId) => api.delete(`/posts/${postId}/like`).then((res) => res.data),
  list: (postId, { page = 1, limit = 20 } = {}) =>
    api.get(`/posts/${postId}/likes`, { params: { page, limit } }).then((res) => res.data),
};
