import api from './api';

const postBody = ({ content, image_url }) => {
  const body = {};
  if (content !== undefined) body.content = content;
  if (image_url !== undefined) body.image_url = image_url || null;
  return body;
};

export const postService = {
  // sort=latest|oldest|popular, optional user_id
  list: ({ page = 1, limit = 10, sort = 'latest', userId } = {}) =>
    api
      .get('/posts', { params: { page, limit, sort, ...(userId && { user_id: userId }) } })
      .then((res) => res.data),
  get: (id) => api.get(`/posts/${id}`).then((res) => res.data),
  create: ({ content, image_url }) => {
    const body = { content };
    if (image_url) body.image_url = image_url;
    return api.post('/posts', body).then((res) => res.data);
  },
  update: (id, changes) => api.put(`/posts/${id}`, postBody(changes)).then((res) => res.data),
  remove: (id) => api.delete(`/posts/${id}`).then((res) => res.data),
};
