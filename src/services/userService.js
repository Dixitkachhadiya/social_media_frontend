import api from './api';

export const PROFILE_FIELDS = ['username', 'full_name', 'bio', 'avatar_url', 'location', 'website'];

export const userService = {
  getMyProfile: () => api.get('/users/profile').then((res) => res.data),
  // Only the documented updatable fields are ever sent
  updateMyProfile: (changes) => {
    const body = Object.fromEntries(Object.entries(changes).filter(([key]) => PROFILE_FIELDS.includes(key)));
    return api.put('/users/profile', body).then((res) => res.data);
  },
  getPublicProfile: (id) => api.get(`/users/${id}`).then((res) => res.data),
};
