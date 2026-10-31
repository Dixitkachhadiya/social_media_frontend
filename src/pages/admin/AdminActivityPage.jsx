import { useState } from 'react';
import { Activity } from 'lucide-react';
import { adminService } from '../../services/adminService';
import usePaginatedList from '../../hooks/usePaginatedList';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useSocketEvent } from '../../context/SocketContext';
import ActivityItem from '../../components/admin/ActivityItem';
import Tabs from '../../components/common/Tabs';
import LoadMore from '../../components/common/LoadMore';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { ListSkeleton } from '../../components/common/Skeleton';

const TYPES = [
  { value: '', label: 'All' },
  { value: 'registration', label: 'Registrations' },
  { value: 'login', label: 'Logins' },
  { value: 'post', label: 'Posts' },
  { value: 'comment', label: 'Comments' },
  { value: 'like', label: 'Likes' },
];

// GET /admin/dashboard/recent-activity?type=... (logins show the latest per user)
export default function AdminActivityPage() {
  useDocumentTitle('Activity');
  const [type, setType] = useState('');
  const list = usePaginatedList((page) => adminService.recentActivity({ page, limit: 20, type }), {
    itemsKey: 'activities',
    deps: [type],
  });

  useSocketEvent('admin:user-login', () => {
    if (type === '' || type === 'login') list.reload();
  });

  return (
    <div className="space-y-4">
      <Tabs label="Activity type" value={type} onChange={setType} options={TYPES} />
      <div className="card overflow-hidden">
        {list.status === 'loading' && <ListSkeleton rows={8} />}
        {list.status === 'error' && <ErrorState message={list.error} onRetry={list.reload} />}
        {list.status === 'ready' && list.items.length === 0 && <EmptyState icon={Activity} title="No activity found" />}
        <ul className="divide-y divide-line">
          {list.items.map((activity, i) => (
            <ActivityItem key={`${activity.type}-${activity.user_id}-${activity.post_id}-${activity.occurred_at}-${i}`} activity={activity} />
          ))}
        </ul>
        <LoadMore hasMore={list.hasMore} loading={list.loadingMore} onClick={list.loadMore} />
      </div>
    </div>
  );
}
