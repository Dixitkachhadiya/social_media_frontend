import { Heart, LogIn, Megaphone, MessageCircle } from 'lucide-react';

// Notification types defined by the backend: like, comment, announcement, login (admins)
export const NOTIFICATION_META = {
  like: { icon: Heart, cls: 'bg-rose-50 text-rose-600', label: 'Like' },
  comment: { icon: MessageCircle, cls: 'bg-sky-50 text-sky-600', label: 'Comment' },
  announcement: { icon: Megaphone, cls: 'bg-brand-50 text-brand-600', label: 'Announcement' },
  login: { icon: LogIn, cls: 'bg-slate-100 text-slate-600', label: 'Login' },
};

export const metaFor = (type) => NOTIFICATION_META[type] ?? NOTIFICATION_META.announcement;

// Where clicking a notification should go
export const targetFor = (notification) => {
  if (notification.post_id) return `/posts/${notification.post_id}`;
  if (notification.type === 'login' && notification.related_user?.id) return `/u/${notification.related_user.id}`;
  return null;
};
