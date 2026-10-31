import { Check, Trash2 } from 'lucide-react';
import { metaFor } from './notificationMeta';
import NotificationMessage from './NotificationMessage';
import { timeAgo } from '../../utils/format';

export default function NotificationItem({ notification, onOpen, onMarkRead, onDelete, busy }) {
  const { icon: Icon, cls, label } = metaFor(notification.type);
  const unread = !notification.is_read;

  return (
    <li className={`group relative flex gap-3 px-4 py-3.5 transition-colors sm:px-5 ${unread ? 'bg-brand-50/40' : ''} hover:bg-slate-50`}>
      <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cls}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </span>

      <button type="button" onClick={() => onOpen(notification)} className="min-w-0 flex-1 text-left">
        <p className={`text-sm ${unread ? 'text-ink' : 'text-ink-soft'}`}>
          <NotificationMessage notification={notification} />
        </p>
        <p className="mt-0.5 text-xs text-muted">
          <time dateTime={notification.created_at}>{timeAgo(notification.created_at)}</time>
        </p>
      </button>

      <div className="flex shrink-0 items-start gap-0.5">
        {unread && (
          <button
            type="button"
            onClick={() => onMarkRead(notification)}
            disabled={busy}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-white hover:text-brand-600 disabled:opacity-50"
            aria-label="Mark as read"
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(notification)}
          disabled={busy}
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-white hover:text-red-600 disabled:opacity-50"
          aria-label="Delete notification"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        {unread && <span className="mt-2.5 ml-1 h-2 w-2 rounded-full bg-brand-600" aria-label="Unread" />}
      </div>
    </li>
  );
}
