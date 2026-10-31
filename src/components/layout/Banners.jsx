import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, MailWarning, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

// Live admin announcement received over Socket.IO
export function AnnouncementBanner() {
  const { announcement, dismissAnnouncement } = useSocket();
  if (!announcement) return null;

  return (
    <div className="animate-slide-up border-b border-brand-100 bg-brand-50" role="status">
      <div className="mx-auto flex max-w-[1120px] items-start gap-3 px-4 py-2.5 sm:px-6">
        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
        <p className="flex-1 text-sm text-brand-700">
          <span className="font-semibold">Announcement{announcement.related_user ? ` from ${announcement.related_user.username}` : ''}: </span>
          {announcement.message}
        </p>
        <button type="button" onClick={dismissAnnouncement} className="rounded p-0.5 text-brand-600 hover:bg-brand-100" aria-label="Dismiss announcement">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Shown until the account's email is verified; leads to the code verification screen
export function VerifyEmailBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.is_email_verified || dismissed) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6">
        <MailWarning className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <p className="flex-1 text-sm text-amber-900">
          Please verify <span className="font-medium">{user.email}</span> to secure your account.
        </p>
        <div className="flex items-center gap-1">
          <Link
            to="/verify-email"
            className="inline-flex h-8 items-center rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink transition-colors hover:bg-slate-50"
          >
            Verify email
          </Link>
          <button type="button" onClick={() => setDismissed(true)} className="rounded p-1 text-amber-800 hover:bg-amber-100" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
