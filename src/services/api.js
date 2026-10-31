import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';
import { tokenStorage } from '../utils/tokenStorage';

const api = axios.create({
  // Selected backend (LOCAL or LIVE); fixed per page load, switching reloads the app
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Requests carry this tab's current session token (read at send time, so a login or logout takes
// effect immediately). Optional-auth routes then return liked_by_me for that user.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  // Remember which session sent the request so late responses can be matched to it
  config.sessionToken = token;
  return config;
});

// AuthContext registers a handler so a 401/403-deactivated anywhere ends the session
let sessionExpiredHandler = null;
export const onSessionExpired = (handler) => {
  sessionExpiredHandler = handler;
};

// Credential endpoints return 401/403 for wrong input; those must not be treated as an expired session
const CREDENTIAL_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/reset-password'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isCredentialCall = CREDENTIAL_ENDPOINTS.some((path) => url.startsWith(path));
    const message = error.response?.data?.message || '';
    // A response to a request from a previous session (before logout/login) must not end the current one
    const sentByCurrentSession = Boolean(error.config?.sessionToken) && error.config.sessionToken === tokenStorage.get();

    if (!isCredentialCall && sentByCurrentSession) {
      if (status === 401) sessionExpiredHandler?.(message || 'Your session has ended. Please log in again.');
      if (status === 403 && /deactivated/i.test(message)) sessionExpiredHandler?.(message);
    }
    return Promise.reject(error);
  },
);

export default api;
