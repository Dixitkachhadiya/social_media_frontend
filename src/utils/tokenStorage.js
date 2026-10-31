// The backend authenticates with "Authorization: Bearer <JWT>" only (no cookies, no refresh token).
//
// Each browser tab owns exactly one session token, held in memory and used for every request.
// It is persisted in sessionStorage (private to the tab, survives reloads). localStorage only
// remembers the most recent login so that a newly opened tab can start signed in.
//
// Requests must never read localStorage directly: it is shared by all tabs, so a login as another
// user in a second tab would silently change the identity of requests sent from the first tab.
//
// Tokens are stored PER BACKEND (LOCAL / LIVE, see config/apiConfig.js): the two backends have different
// databases and JWT secrets, so a token issued by one is never sent to the other.
import { ACTIVE_API_MODE } from '../config/apiConfig';

const TOKEN_KEY = `circlo.token.${ACTIVE_API_MODE}`;

// One-time migration: tokens saved before per-backend storage were always issued by the local backend
const LEGACY_KEY = 'circlo.token';
try {
  for (const store of [sessionStorage, localStorage]) {
    const legacy = store.getItem(LEGACY_KEY);
    if (legacy && !store.getItem('circlo.token.LOCAL')) store.setItem('circlo.token.LOCAL', legacy);
    store.removeItem(LEGACY_KEY);
  }
} catch {
  /* storage unavailable */
}

const read = (store) => {
  try {
    return store.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const write = (store, value) => {
  try {
    if (value) store.setItem(TOKEN_KEY, value);
    else store.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: the session lives in memory until the tab closes */
  }
};

const sessionStore = () => (typeof sessionStorage === 'undefined' ? null : sessionStorage);
const sharedStore = () => (typeof localStorage === 'undefined' ? null : localStorage);

// This tab's token: its own session first, otherwise the latest login from any tab
let activeToken = (sessionStore() && read(sessionStore())) || (sharedStore() && read(sharedStore())) || null;

export const tokenStorage = {
  key: TOKEN_KEY,

  // The token of the session shown in THIS tab
  get() {
    return activeToken;
  },

  // Starts a session in this tab (login/register)
  set(token) {
    activeToken = token;
    if (sessionStore()) write(sessionStore(), token);
    if (sharedStore()) write(sharedStore(), token);
  },

  // Ends this tab's session. The shared "last login" is cleared only if it is this tab's token,
  // so logging out here never touches a different account signed in from another tab.
  clear() {
    const previous = activeToken;
    activeToken = null;
    if (sessionStore()) write(sessionStore(), null);
    if (sharedStore() && read(sharedStore()) === previous) write(sharedStore(), null);
  },
};
