import { Link, NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Logo, { LogoMark } from '../common/Logo';
import Avatar from '../common/Avatar';
import { ADMIN_NAV, PRIMARY_NAV } from './navItems';
import { displayName } from '../../utils/format';

function CountBadge({ count, compact }) {
  if (!count) return null;
  const label = count > 99 ? '99+' : count;
  return compact ? (
    <span className="absolute top-1.5 right-1.5 min-w-4 rounded-full bg-brand-600 px-1 text-center text-[10px] leading-4 font-semibold text-white">
      {label}
    </span>
  ) : (
    <span className="ml-auto rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">{label}</span>
  );
}

function NavItem({ item, badgeCount }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={item.label}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors
         md:justify-center lg:justify-start
         ${isActive ? 'bg-brand-50 font-semibold text-brand-700' : 'text-ink-soft hover:bg-slate-100 hover:text-ink'}`
      }
    >
      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="md:sr-only lg:not-sr-only">{item.label}</span>
      <span className="hidden lg:contents">
        <CountBadge count={badgeCount} />
      </span>
      <span className="lg:hidden">
        <CountBadge count={badgeCount} compact />
      </span>
    </NavLink>
  );
}

// Desktop: full sidebar. Tablet: icon rail. Mobile: hidden (bottom nav instead).
export default function Sidebar() {
  const { user, profile, isAdmin, logout } = useAuth();
  const { unreadCount } = useSocket();

  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-white px-3 py-5 md:flex md:w-[76px] lg:w-64">
      <Link to="/" className="mb-7 flex items-center px-2 md:justify-center lg:justify-start" aria-label="Home">
        <span className="hidden lg:inline-flex">
          <Logo />
        </span>
        <span className="lg:hidden">
          <LogoMark />
        </span>
      </Link>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-0.5">
        {PRIMARY_NAV.map((item) => (
          <NavItem key={item.to} item={item} badgeCount={item.badge === 'notifications' ? unreadCount : 0} />
        ))}
        {isAdmin && (
          <>
            <div className="mx-3 my-3 border-t border-line" />
            <NavItem item={ADMIN_NAV} />
          </>
        )}
      </nav>

      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-center gap-3 px-2 md:justify-center lg:justify-start">
          <Link to="/profile" className="flex min-w-0 items-center gap-3" title="My profile">
            <Avatar src={profile?.avatar_url} name={displayName({ ...profile, username: user?.username })} size="sm" />
            <span className="hidden min-w-0 lg:block">
              <span className="block truncate text-sm font-medium text-ink">{displayName({ ...profile, username: user?.username })}</span>
              <span className="block truncate text-xs text-muted">@{user?.username}</span>
            </span>
          </Link>
        </div>
        <button
          type="button"
          onClick={logout}
          title="Log out"
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-ink-soft transition-colors hover:bg-red-50
            hover:text-red-600 md:justify-center lg:justify-start"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          <span className="md:sr-only lg:not-sr-only">Log out</span>
        </button>
      </div>
    </aside>
  );
}
