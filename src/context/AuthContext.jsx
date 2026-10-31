import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { onSessionExpired } from '../services/api';
import { tokenStorage } from '../utils/tokenStorage';

const AuthContext = createContext(null);

// A response may arrive after the user logged out or another account logged in: only apply it
// if this tab is still on the session (token) that sent the request.
const isCurrentSession = (sessionToken) => Boolean(sessionToken) && tokenStorage.get() === sessionToken;

/**
 * Session state for the whole app.
 * status: 'loading' (validating a stored token) | 'authenticated' | 'guest' | 'unreachable' (server down)
 * user:    account from /auth/me (id, username, email, role, is_email_verified, ...)
 * profile: profile fields from /users/profile (full_name, bio, avatar_url, location, website)
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStorage.get());
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'loading' : 'guest'));
  // Where GuestRoute sends a user right after authenticating (e.g. email verification after sign-up)
  const [landingPath, setLandingPath] = useState(null);
  const endingRef = useRef(false);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    setUser(null);
    setProfile(null);
    setStatus('guest');
  }, []);

  const loadProfile = useCallback(async (expectedUserId) => {
    const sessionToken = tokenStorage.get();
    try {
      const { user: own } = await userService.getMyProfile();
      if (!isCurrentSession(sessionToken) || own.id !== expectedUserId) return;
      setProfile(own.profile);
      setUser((current) =>
        current?.id === own.id ? { ...current, username: own.username, is_email_verified: own.is_email_verified } : current,
      );
    } catch {
      /* the avatar falls back to initials; errors surface on the profile page */
    }
  }, []);

  const startSession = useCallback(
    (newToken, newUser) => {
      endingRef.current = false;
      // Replaces any previous session in this tab: the old token is no longer sent anywhere
      tokenStorage.set(newToken);
      setToken(newToken);
      setUser(newUser);
      setProfile(null);
      setStatus('authenticated');
      loadProfile(newUser.id);
    },
    [loadProfile],
  );

  // Validate a stored token against GET /auth/me
  const validateStoredToken = useCallback(async () => {
    const sessionToken = tokenStorage.get();
    if (!sessionToken) return;
    setStatus('loading');
    try {
      const { user: me } = await authService.me();
      if (!isCurrentSession(sessionToken)) return;
      setToken(sessionToken);
      setUser(me);
      setStatus('authenticated');
      loadProfile(me.id);
    } catch (error) {
      if (!isCurrentSession(sessionToken)) return;
      // Only a rejected token (401) or a deactivated account (403) ends the session. A server that is
      // unreachable, busy or failing (5xx, 429, e.g. on a page refresh) keeps the token: the user retries.
      const status = error.response?.status;
      if (status !== 401 && status !== 403) {
        setStatus('unreachable');
        return;
      }
      clearSession();
    }
  }, [clearSession, loadProfile]);

  const startupRef = useRef(false);
  useEffect(() => {
    if (startupRef.current) return;
    startupRef.current = true;
    validateStoredToken();
  }, [validateStoredToken]);

  // Any 401 (or deactivated 403) from an authenticated request ends the session once
  const endSession = useCallback(
    (message) => {
      if (endingRef.current) return;
      endingRef.current = true;
      clearSession();
      toast.error(message || 'Your session has ended. Please log in again.', { id: 'session-ended' });
    },
    [clearSession],
  );

  useEffect(() => {
    onSessionExpired(endSession);
    return () => onSessionExpired(null);
  }, [endSession]);

  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials);
      setLandingPath(null);
      startSession(data.token, data.user);
      return data;
    },
    [startSession],
  );

  // Registration logs the user in and lands on the email verification screen,
  // where the user requests a code (GuestRoute reads landingPath when redirecting)
  const register = useCallback(
    async (details) => {
      const data = await authService.register(details);
      setLandingPath('/verify-email');
      startSession(data.token, data.user);
      return data;
    },
    [startSession],
  );

  const logout = useCallback(() => {
    endingRef.current = true;
    clearSession();
    toast.success('You have been logged out.', { id: 'logout' });
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const sessionToken = tokenStorage.get();
    const { user: me } = await authService.me();
    if (isCurrentSession(sessionToken)) setUser(me);
    return me;
  }, []);

  // Called after PUT /users/profile with the returned user object
  const applyProfileUpdate = useCallback((updated) => {
    setProfile(updated.profile);
    setUser((current) => (current ? { ...current, username: updated.username } : current));
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      profile,
      status,
      isAuthenticated: status === 'authenticated',
      isAdmin: user?.role === 'admin',
      landingPath,
      login,
      register,
      logout,
      refreshUser,
      applyProfileUpdate,
      endSession,
      retryConnection: validateStoredToken,
    }),
    [token, user, profile, status, landingPath, login, register, logout, refreshUser, applyProfileUpdate, endSession, validateStoredToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
