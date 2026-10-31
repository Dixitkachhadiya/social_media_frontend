import api from './api';
import { AI_TIMEOUT } from '../utils/constants';

// Adding and editing are moderated by the AI model before saving

export const commentService = {
  list: (postId, { page = 1, limit = 20 } = {}) =>
    api.get(`/posts/${postId}/comments`, { params: { page, limit } }).then((res) => res.data),
  add: (postId, content) => api.post(`/posts/${postId}/comments`, { content }, { timeout: AI_TIMEOUT }).then((res) => res.data),
  update: (commentId, content) => api.put(`/comments/${commentId}`, { content }, { timeout: AI_TIMEOUT }).then((res) => res.data),
  remove: (commentId) => api.delete(`/comments/${commentId}`).then((res) => res.data),
};
