import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/authService';
import { SOCKET_URL } from '../config/apiConfig';
import NotificationToast from '../components/notifications/NotificationToast';

const SocketContext = createContext(null);

// connect_error messages that mean the JWT can no longer be used
const SESSION_ERRORS = /expired|invalid token|no longer exists|deactivated|log in again/i;

/**
 * One Socket.IO connection per logged-in session (server-assigned rooms, no client joins).
 * Owns the unread notification count and re-broadcasts socket events to subscribed pages.
 */
export function SocketProvider({ children }) {
  const { token, user, endSession } = useAuth();
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [announcement, setAnnouncement] = useState(null);
  const listenersRef = useRef(new Map());

  const subscribe = useCallback((event, handler) => {
    const listeners = listenersRef.current;
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => listeners.get(event)?.delete(handler);
  }, []);

  const publish = useCallback((event, payload) => {
    listenersRef.current.get(event)?.forEach((handler) => handler(payload));
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { unread_count: count } = await notificationService.unreadCount();
      setUnreadCount(count);
    } catch {
      /* the badge keeps its last value; 401s are handled globally */
    }
  }, []);

  const userId = user?.id;

  useEffect(() => {
    if (!token || !userId) {
      setUnreadCount(0);
      setAnnouncement(null);
      return undefined;
    }

    refreshUnreadCount();
    // One socket per session: it authenticates with this tab's token and is closed by the cleanup
    // below on logout or account switch, before the next user's socket is opened.
    const socket = io(SOCKET_URL, { auth: { token } });

    // Fired by the server after authentication, on the first connect and every reconnect:
    // fetch whatever was missed while offline
    socket.on('connected', ({ user_id: socketUserId }) => {
      // The server derives the identity from the JWT; it must be the user this tab displays
      if (socketUserId !== userId) {
        socket.disconnect();
        return;
      }
      setConnected(true);
      refreshUnreadCount();
      publish('reconnected');
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      // The server disconnects deactivated/deleted users; confirm via HTTP so the session ends cleanly
      if (reason === 'io server disconnect') authService.me().catch(() => {});
    });

    socket.on('notification', (notification) => {
      setUnreadCount((count) => count + 1);
      toast.custom((t) => <NotificationToast toastId={t.id} visible={t.visible} notification={notification} />, {
        id: `notification-${notification.id}`,
        duration: 5000,
      });
      publish('notification', notification);
    });

    // Announcements are stored per user without an id in the payload, so refetch instead of inserting
    socket.on('announcement', (payload) => {
      setAnnouncement(payload);
      refreshUnreadCount();
      publish('announcement', payload);
    });

    socket.on('admin:user-login', (payload) => publish('admin:user-login', payload));

    socket.on('connect_error', (error) => {
      setConnected(false);
      if (SESSION_ERRORS.test(error.message)) {
        socket.disconnect();
        endSession(error.message);
      }
      // Other errors (server down) are retried automatically by Socket.IO
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      setConnected(false);
    };
  }, [token, userId, refreshUnreadCount, publish, endSession]);

  const value = useMemo(
    () => ({
      connected,
      unreadCount,
      setUnreadCount,
      refreshUnreadCount,
      announcement,
      dismissAnnouncement: () => setAnnouncement(null),
      subscribe,
    }),
    [connected, unreadCount, refreshUnreadCount, announcement, subscribe],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used inside SocketProvider');
  return context;
};

// Subscribe a component to a socket event for its lifetime
// eslint-disable-next-line react-refresh/only-export-components
export const useSocketEvent = (event, handler) => {
  const { subscribe } = useSocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => subscribe(event, (payload) => handlerRef.current(payload)), [event, subscribe]);
};
