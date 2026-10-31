import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, FileText, Heart, LogIn, MessageCircle, RefreshCw, ShieldCheck, UserCheck, UserPlus, Users } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useSocketEvent } from '../../context/SocketContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../utils/apiError';
import { formatDateTime, timeAgo } from '../../utils/format';
import { StatTile, SectionCard, RoleBadge, StatusBadge } from '../../components/admin/AdminBits';
import ActivityItem from '../../components/admin/ActivityItem';
import ErrorState from '../../components/common/ErrorState';
import { ListSkeleton, Skeleton } from '../../components/common/Skeleton';
import Button from '../../components/common/Button';

export default function AdminOverviewPage() {
  useDocumentTitle('Admin dashboard');
  const [data, setData] = useState({ status: 'loading', stats: null, activity: [], recentUsers: [], error: null });
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const refreshTimer = useRef(null);

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    try {
      const [statsRes, activityRes, usersRes] = await Promise.all([
        adminService.stats(),
        adminService.recentActivity({ limit: 8 }),
        adminService.recentUsers({ sort: 'registered', limit: 5 }),
      ]);
      setData({ status: 'ready', stats: statsRes.stats, activity: activityRes.activities, recentUsers: usersRes.users, error: null });
      setLastUpdated(new Date());
    } catch (error) {
      setData((d) => (d.stats ? d : { ...d, status: 'error', error: errorMessage(error) }));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => clearTimeout(refreshTimer.current);
  }, [load]);

  // Live: refresh (debounced) when a user logs in
  useSocketEvent('admin:user-login', () => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => load({ quiet: true }), 800);
  });

  if (data.status === 'error') return <ErrorState message={data.error} onRetry={() => load()} />;

  const { stats } = data;
  const loading = data.status === 'loading';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {lastUpdated ? `Updated ${formatDateTime(lastUpdated)}. Refreshes automatically when users log in.` : 'Loading live statistics…'}
        </p>
        <Button variant="secondary" size="sm" onClick={() => load({ quiet: true })} loading={refreshing}>
          {!refreshing && <RefreshCw className="h-4 w-4" aria-hidden="true" />} Refresh
        </Button>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink-soft">Users</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)
          ) : (
            <>
              <StatTile label="Total users" value={stats.users.total} icon={Users} hint={`${stats.users.new_last_7_days} new in the last 7 days`} />
              <StatTile label="Active" value={stats.users.active} icon={UserCheck} hint={`${stats.users.inactive} inactive`} />
              <StatTile label="Verified emails" value={stats.users.verified} icon={BadgeCheck} hint={`${stats.users.admins} admin${stats.users.admins === 1 ? '' : 's'}`} />
              <StatTile label="Active in 24h" value={stats.users.logins_last_24_hours} icon={LogIn} hint="Users who logged in" />
            </>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink-soft">Content</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)
          ) : (
            <>
              <StatTile label="Posts" value={stats.content.posts} icon={FileText} hint={`${stats.content.new_posts_last_7_days} in the last 7 days`} />
              <StatTile label="Comments" value={stats.content.comments} icon={MessageCircle} />
              <StatTile label="Likes" value={stats.content.likes} icon={Heart} />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Recent activity"
          action={
            <Link to="/admin/activity" className="link text-xs">
              View all
            </Link>
          }
        >
          {loading ? (
            <ListSkeleton rows={5} />
          ) : data.activity.length ? (
            <ul className="divide-y divide-line">
              {data.activity.map((activity, i) => (
                <ActivityItem key={`${activity.type}-${activity.user_id}-${activity.occurred_at}-${i}`} activity={activity} />
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-muted">No activity yet.</p>
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="New registrations"
            action={
              <Link to="/admin/users" className="link text-xs">
                Manage users
              </Link>
            }
          >
            {loading ? (
              <ListSkeleton rows={3} />
            ) : (
              <ul className="divide-y divide-line">
                {data.recentUsers.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 px-4 py-2.5">
                    <UserPlus className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    <Link to={`/admin/users?user=${u.id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-ink hover:underline">
                      {u.username}
                    </Link>
                    <RoleBadge role={u.role} />
                    <StatusBadge active={u.is_active} />
                    <span className="hidden text-xs text-muted sm:inline">{timeAgo(u.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Recent logins">
            {loading ? (
              <ListSkeleton rows={3} />
            ) : stats.recent_logins.length ? (
              <ul className="divide-y divide-line">
                {stats.recent_logins.map((login) => (
                  <li key={login.id} className="flex items-center gap-3 px-4 py-2.5">
                    {login.role === 'admin' ? (
                      <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    ) : (
                      <LogIn className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                    )}
                    <Link to={`/admin/users?user=${login.id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-ink hover:underline">
                      {login.username}
                    </Link>
                    <span className="text-xs text-muted" title={formatDateTime(login.last_login_at)}>
                      {timeAgo(login.last_login_at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-8 text-center text-sm text-muted">No logins recorded yet.</p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
