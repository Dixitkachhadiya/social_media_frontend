import api from './api';

export const authService = {
  register: ({ username, email, password }) =>
    api.post('/auth/register', { username, email, password }).then((res) => res.data),
  login: ({ email, password }) => api.post('/auth/login', { email, password }).then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data),

  // Email verification (6-digit code). Both calls use the JWT: only your own email can be verified.
  sendVerification: () => api.post('/auth/send-verification').then((res) => res.data),
  verifyEmail: (otp) => api.post('/auth/verify-email', { otp }).then((res) => res.data),

  // Password recovery: email -> code -> single-use reset token -> new password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((res) => res.data),
  verifyResetOtp: ({ email, otp }) => api.post('/auth/verify-reset-otp', { email, otp }).then((res) => res.data),
  verifyResetToken: (token) => api.post('/auth/verify-reset-token', { token }).then((res) => res.data),
  resetPassword: ({ token, password }) => api.post('/auth/reset-password', { token, password }).then((res) => res.data),
};
