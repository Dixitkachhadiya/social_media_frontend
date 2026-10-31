import { NavLink } from 'react-router-dom';
import { Bell, Compass, Home, Plus, UserRound } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/create', label: 'Create', icon: Plus, primary: true },
  { to: '/notifications', label: 'Alerts', icon: Bell, badge: true },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

// Bottom tab bar for phones; AI, Settings and Admin live in the avatar menu
export default function MobileNav() {
  const { unreadCount } = useSocket();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium
                 ${isActive ? 'text-brand-700' : 'text-muted'}`
              }
            >
              {item.primary ? (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
              ) : (
                <item.icon className="h-5 w-5" aria-hidden="true" />
              )}
              <span className={item.primary ? 'sr-only' : ''}>{item.label}</span>
              {item.badge && unreadCount > 0 && (
                <span className="absolute top-1.5 left-1/2 ml-1 min-w-4 rounded-full bg-brand-600 px-1 text-center text-[10px] leading-4 font-semibold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
