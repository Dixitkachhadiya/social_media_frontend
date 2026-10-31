import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationService } from '../../services/notificationService';
import { useSocket, useSocketEvent } from '../../context/SocketContext';
import { errorMessage } from '../../utils/apiError';
import { timeAgo } from '../../utils/format';
import { metaFor, targetFor } from './notificationMeta';
import NotificationMessage from './NotificationMessage';
import Spinner from '../common/Spinner';

const PREVIEW_LIMIT = 6;

/**
 * Top-bar bell: unread badge (from SocketContext) and a dropdown of the latest notifications
 * (GET /notifications). Opening it refetches; live "notification" events are added on top.
 */
export default function NotificationBell() {
  const navigate = useNavigate();
  const { unreadCount, setUnreadCount, connected, status: socketStatus } = useSocket();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ status: 'idle', items: [], error: null });
  const [markingAll, setMarkingAll] = useState(false);
  const rootRef = useRef(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: s.items.length ? 'refreshing' : 'loading', error: null }));
    try {
      const res = await notificationService.list({ limit: PREVIEW_LIMIT });
      setState({ status: 'ready', items: res.notifications, error: null });
      setUnreadCount(res.unread_count);
    } catch (error) {
      setState((s) => ({ ...s, status: 'error', error: errorMessage(error) }));
    }
  }, [setUnreadCount]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => !rootRef.current?.contains(event.target) && setOpen(false);
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Keep the cached preview current; announcements carry no id, so refetch when open
  useSocketEvent('notification', (notification) =>
    setState((s) => ({ ...s, items: [notification, ...s.items.filter((n) => n.id !== notification.id)].slice(0, PREVIEW_LIMIT) })),
  );
  useSocketEvent('announcement', () => open && load());
  useSocketEvent('reconnected', () => open && load());

  const openNotification = async (notification) => {
    setOpen(false);
    if (!notification.is_read) {
      try {
        const res = await notificationService.markRead(notification.id);
        setUnreadCount(res.unread_count);
        setState((s) => ({ ...s, items: s.items.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)) }));
      } catch (error) {
        toast.error(errorMessage(error));
      }
    }
    const target = targetFor(notification);
    navigate(target || '/notifications');
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      const res = await notificationService.markAllRead();
      setUnreadCount(res.unread_count);
      setState((s) => ({ ...s, items: s.items.map((n) => ({ ...n, is_read: true })) }));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 hover:text-ink
          ${open ? 'bg-slate-100 text-ink' : 'text-ink-soft'}`}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        title={connected ? 'Notifications (live)' : socketStatus === 'offline' ? 'Notifications (live updates off)' : 'Notifications (reconnecting…)'}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-4 rounded-full bg-brand-600 px-1 text-center text-[10px] leading-4 font-semibold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Recent notifications"
          className="absolute right-0 z-40 mt-2 w-[min(380px,calc(100vw-2rem))] animate-fade-in overflow-hidden rounded-xl border border-line bg-white shadow-pop"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">
              Notifications {unreadCount > 0 && <span className="font-normal text-muted">· {unreadCount} unread</span>}
            </p>
            <button
              type="button"
              onClick={markAll}
              disabled={!unreadCount || markingAll}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:text-slate-400"
            >
              {markingAll ? <Spinner className="h-3 w-3" /> : <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />}
              Mark all read
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {state.status === 'loading' && (
              <div className="flex justify-center py-10 text-brand-600">
                <Spinner label="Loading notifications" />
              </div>
            )}
            {state.status === 'error' && !state.items.length && (
              <p className="px-4 py-8 text-center text-sm text-muted">
                {state.error}{' '}
                <button type="button" onClick={load} className="link">
                  Retry
                </button>
              </p>
            )}
            {state.status === 'ready' && !state.items.length && (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <BellOff className="mb-2 h-5 w-5 text-muted" aria-hidden="true" />
                <p className="text-sm text-muted">No notifications yet.</p>
              </div>
            )}
            {state.items.length > 0 && (
              <ul className="divide-y divide-line">
                {state.items.map((notification) => {
                  const { icon: Icon, cls } = metaFor(notification.type);
                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => openNotification(notification)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50
                          ${notification.is_read ? '' : 'bg-brand-50/40'}`}
                      >
                        <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cls}`}>
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 block text-sm text-ink-soft">
                            <NotificationMessage notification={notification} />
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">{timeAgo(notification.created_at)}</span>
                        </span>
                        {!notification.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-slate-50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
