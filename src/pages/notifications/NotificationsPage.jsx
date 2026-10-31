import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BellOff, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationService } from '../../services/notificationService';
import { useSocket, useSocketEvent } from '../../context/SocketContext';
import usePaginatedList from '../../hooks/usePaginatedList';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../utils/apiError';
import NotificationItem from '../../components/notifications/NotificationItem';
import { targetFor } from '../../components/notifications/notificationMeta';
import Tabs from '../../components/common/Tabs';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import LoadMore from '../../components/common/LoadMore';
import { ListSkeleton } from '../../components/common/Skeleton';

export default function NotificationsPage() {
  useDocumentTitle('Notifications');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const unreadOnly = params.get('filter') === 'unread';
  const { unreadCount, setUnreadCount } = useSocket();
  const [busyId, setBusyId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const list = usePaginatedList((page) => notificationService.list({ page, limit: 20, unread: unreadOnly }), {
    itemsKey: 'notifications',
    deps: [unreadOnly],
  });

  // Live updates: new notifications appear at the top; announcements and reconnects refetch
  useSocketEvent('notification', (notification) => list.prependItem(notification));
  useSocketEvent('announcement', () => list.reload());
  useSocketEvent('reconnected', () => list.reload());

  const markRead = async (notification) => {
    if (notification.is_read) return;
    setBusyId(notification.id);
    try {
      const res = await notificationService.markRead(notification.id);
      setUnreadCount(res.unread_count);
      if (unreadOnly) list.removeItem(notification.id);
      else list.updateItem(notification.id, { is_read: true });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const open = async (notification) => {
    const target = targetFor(notification);
    if (!notification.is_read) await markRead(notification);
    if (target) navigate(target);
  };

  const remove = async (notification) => {
    setBusyId(notification.id);
    try {
      await notificationService.remove(notification.id);
      list.removeItem(notification.id);
      if (!notification.is_read) setUnreadCount((count) => Math.max(0, count - 1));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      const res = await notificationService.markAllRead();
      setUnreadCount(res.unread_count);
      if (unreadOnly) list.reload();
      else list.setItems((items) => items.map((n) => ({ ...n, is_read: true })));
      toast.success(res.updated ? `Marked ${res.updated} as read` : 'Everything was already read');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="Filter notifications"
          value={unreadOnly ? 'unread' : 'all'}
          onChange={(value) => setParams(value === 'unread' ? { filter: 'unread' } : {})}
          options={[
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread', count: unreadCount || undefined },
          ]}
        />
        <Button variant="secondary" size="sm" onClick={markAll} loading={markingAll} disabled={!unreadCount}>
          {!markingAll && <CheckCheck className="h-4 w-4" aria-hidden="true" />}
          Mark all as read
        </Button>
      </div>

      <div className="card overflow-hidden">
        {list.status === 'loading' && <ListSkeleton rows={5} />}
        {list.status === 'error' && <ErrorState message={list.error} onRetry={list.reload} />}
        {list.status === 'ready' && list.items.length === 0 && (
          <EmptyState
            icon={BellOff}
            title={unreadOnly ? "You're all caught up" : 'No notifications yet'}
            description={unreadOnly ? 'No unread notifications.' : "When someone likes or comments on your posts, you'll see it here."}
          />
        )}
        {list.items.length > 0 && (
          <ul className="divide-y divide-line">
            {list.items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                busy={busyId === notification.id}
                onOpen={open}
                onMarkRead={markRead}
                onDelete={remove}
              />
            ))}
          </ul>
        )}
        <LoadMore hasMore={list.hasMore} loading={list.loadingMore} onClick={list.loadMore} />
      </div>
    </div>
  );
}
