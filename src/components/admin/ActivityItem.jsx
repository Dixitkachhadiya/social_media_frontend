import { Link } from 'react-router-dom';
import { ACTIVITY_META } from './AdminBits';
import { formatDateTime, timeAgo } from '../../utils/format';

export default function ActivityItem({ activity }) {
  const meta = ACTIVITY_META[activity.type] ?? ACTIVITY_META.login;
  const Icon = meta.icon;

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.cls}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <p className="min-w-0 flex-1 text-sm text-ink-soft">
        <Link to={`/u/${activity.user_id}`} className="font-medium text-ink hover:underline">
          {activity.username}
        </Link>{' '}
        {activity.post_id ? (
          <Link to={`/posts/${activity.post_id}`} className="hover:text-ink hover:underline">
            {meta.label}
          </Link>
        ) : (
          meta.label
        )}
      </p>
      <time className="shrink-0 text-xs text-muted" dateTime={activity.occurred_at} title={formatDateTime(activity.occurred_at)}>
        {timeAgo(activity.occurred_at)}
      </time>
    </li>
  );
}
