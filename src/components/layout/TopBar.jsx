import { Link, useLocation } from 'react-router-dom';
import { PenSquare } from 'lucide-react';
import { LogoMark } from '../common/Logo';
import NotificationBell from '../notifications/NotificationBell';
import UserMenu from './UserMenu';
import { titleForPath } from './navItems';

export default function TopBar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="md:hidden" aria-label="Home">
          <LogoMark className="h-7 w-7" />
        </Link>
        <h1 className="truncate text-base font-semibold text-ink md:text-lg">{titleForPath(pathname)}</h1>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            to="/create"
            className="hidden h-9 items-center gap-2 rounded-lg bg-brand-600 px-3.5 text-sm font-medium text-white shadow-sm transition-colors
              hover:bg-brand-700 sm:inline-flex"
          >
            <PenSquare className="h-4 w-4" aria-hidden="true" />
            Create post
          </Link>

          <NotificationBell />

          <div className="ml-1">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
