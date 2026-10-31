// Central backend configuration: the ONLY place the backend URLs are defined.
// Every API request (services/api.js) and the Socket.IO connection (context/SocketContext.jsx) use it.

export const LOCAL_API_URL = 'http://localhost:5000/api';
export const LIVE_API_URL = 'https://social-media-backend-1-37wu.onrender.com/api';

export const API_MODES = { LOCAL: LOCAL_API_URL, LIVE: LIVE_API_URL };

// The one setting to change. Development uses it until you pick another mode with the on-screen switcher;
// production builds always use PRODUCTION_API_MODE (no switcher, no localStorage override).
// Both can also be set at build time with VITE_API_MODE=LOCAL|LIVE.
const DEFAULT_DEV_API_MODE = 'LOCAL';
const PRODUCTION_API_MODE = 'LIVE';

export const IS_DEV = import.meta.env.DEV;
const MODE_STORAGE_KEY = 'circlo.apiMode';
const SWITCHED_FLAG_KEY = 'circlo.apiModeSwitched';

const valid = (mode) => (mode && Object.hasOwn(API_MODES, mode) ? mode : null);

const readStoredMode = () => {
  try {
    return valid(localStorage.getItem(MODE_STORAGE_KEY));
  } catch {
    return null;
  }
};

const resolveMode = () => {
  const fromEnv = valid(import.meta.env.VITE_API_MODE);
  if (!IS_DEV) return fromEnv || PRODUCTION_API_MODE;
  return readStoredMode() || fromEnv || DEFAULT_DEV_API_MODE;
};

// Fixed for the lifetime of the page: switching reloads the app (see switchApiMode)
export const ACTIVE_API_MODE = resolveMode();
export const BASE_URL = API_MODES[ACTIVE_API_MODE];
// Socket.IO runs on the same origin as the API, without the /api suffix
export const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, '');

/**
 * Development only: selects LOCAL or LIVE and reloads the page.
 * The reload rebuilds the Axios instance with the new base URL, discards every in-flight request
 * (so no stale response can reach the new environment), reconnects Socket.IO to the new backend,
 * and makes AuthContext load that environment's own token (see utils/tokenStorage.js).
 */
export const switchApiMode = (mode) => {
  if (!IS_DEV || !valid(mode) || mode === ACTIVE_API_MODE) return;
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
    sessionStorage.setItem(SWITCHED_FLAG_KEY, mode);
  } catch {
    return; // storage blocked: the choice could not be persisted, so don't reload into the old mode
  }
  window.location.reload();
};

// After a switch-triggered reload: returns the new mode once (used to show a confirmation toast)
export const consumeSwitchNotice = () => {
  try {
    const mode = sessionStorage.getItem(SWITCHED_FLAG_KEY);
    sessionStorage.removeItem(SWITCHED_FLAG_KEY);
    return valid(mode);
  } catch {
    return null;
  }
};
