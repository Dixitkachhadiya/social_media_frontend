import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { metaFor, targetFor } from './notificationMeta';
import NotificationMessage from './NotificationMessage';

// Rendered by the <Toaster>, which sits inside the router
export default function NotificationToast({ toastId, visible, notification }) {
  const { icon: Icon, cls } = metaFor(notification.type);
  const target = targetFor(notification);

  return (
    <div
      className={`pointer-events-auto flex w-[340px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-line bg-white p-3.5 shadow-pop
        transition-all ${visible ? 'animate-slide-up opacity-100' : 'opacity-0'}`}
      role="status"
    >
      <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cls}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm text-ink-soft">
          <NotificationMessage notification={notification} />
        </p>
        {target && (
          <Link to={target} className="link mt-1 inline-block text-xs" onClick={() => toast.dismiss(toastId)}>
            View
          </Link>
        )}
      </div>
      <button type="button" onClick={() => toast.dismiss(toastId)} className="rounded p-0.5 text-muted hover:text-ink" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
