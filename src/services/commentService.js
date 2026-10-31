import api from './api';

export const commentService = {
  list: (postId, { page = 1, limit = 20 } = {}) =>
    api.get(`/posts/${postId}/comments`, { params: { page, limit } }).then((res) => res.data),
  add: (postId, content) => api.post(`/posts/${postId}/comments`, { content }).then((res) => res.data),
  update: (commentId, content) => api.put(`/comments/${commentId}`, { content }).then((res) => res.data),
  remove: (commentId) => api.delete(`/comments/${commentId}`).then((res) => res.data),
};
