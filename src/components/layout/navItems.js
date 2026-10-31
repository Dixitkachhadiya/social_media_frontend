import { Bell, Compass, Home, LayoutDashboard, PenSquare, Settings, Sparkles, UserRound } from 'lucide-react';

// Only features backed by real API endpoints appear here (no saved posts, follows or messages)
export const PRIMARY_NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
  { to: '/create', label: 'Create Post', icon: PenSquare },
  { to: '/ai', label: 'AI Assistant', icon: Sparkles },
  { to: '/profile', label: 'My Profile', icon: UserRound },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const ADMIN_NAV = { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard };

const TITLES = [
  [/^\/$/, 'Home'],
  [/^\/explore/, 'Explore'],
  [/^\/notifications/, 'Notifications'],
  [/^\/create/, 'Create post'],
  [/^\/ai/, 'AI Assistant'],
  [/^\/profile/, 'My profile'],
  [/^\/u\//, 'Profile'],
  [/^\/posts\//, 'Post'],
  [/^\/settings/, 'Settings'],
  [/^\/admin/, 'Admin'],
];

export const titleForPath = (pathname) => TITLES.find(([pattern]) => pattern.test(pathname))?.[1] ?? '';
