import { Heart, LogIn, MessageCircle, PenSquare, UserPlus } from 'lucide-react';

export function StatTile({ label, value, hint, icon: Icon }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink tabular-nums">{value == null ? '—' : Number(value).toLocaleString()}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Inactive
    </span>
  );
}

export function RoleBadge({ role }) {
  return role === 'admin' ? (
    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">Admin</span>
  ) : (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">User</span>
  );
}

export function VerifiedBadge({ verified }) {
  return verified ? (
    <span className="text-xs font-medium text-emerald-700">Verified</span>
  ) : (
    <span className="text-xs font-medium text-amber-700">Unverified</span>
  );
}

// Activity types from GET /admin/dashboard/recent-activity
export const ACTIVITY_META = {
  registration: { icon: UserPlus, label: 'joined', cls: 'bg-emerald-50 text-emerald-600' },
  login: { icon: LogIn, label: 'logged in', cls: 'bg-slate-100 text-slate-600' },
  post: { icon: PenSquare, label: 'published a post', cls: 'bg-brand-50 text-brand-600' },
  comment: { icon: MessageCircle, label: 'commented on a post', cls: 'bg-sky-50 text-sky-600' },
  like: { icon: Heart, label: 'liked a post', cls: 'bg-rose-50 text-rose-600' },
};

export function SectionCard({ title, action, children, className = '' }) {
  return (
    <section className={`card overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
