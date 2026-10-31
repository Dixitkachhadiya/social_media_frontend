import { NavLink, Outlet } from 'react-router-dom';
import { Activity, LayoutGrid, Megaphone, ShieldCheck, Users } from 'lucide-react';

const SECTIONS = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/activity', label: 'Activity', icon: Activity },
  { to: '/admin/moderation', label: 'Moderation', icon: ShieldCheck },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
];

export default function AdminLayout() {
  return (
    <div className="space-y-5">
      <nav aria-label="Admin sections" className="-mx-4 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-1">
          {SECTIONS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors
                   ${isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-muted hover:text-ink'}`
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}
