import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Settings, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Dropdown from '../common/Dropdown';
import Avatar from '../common/Avatar';
import { displayName } from '../../utils/format';

export default function UserMenu() {
  const { user, profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const name = displayName({ ...profile, username: user?.username });

  return (
    <Dropdown
      header={
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <p className="truncate text-xs text-muted">{user?.email}</p>
        </div>
      }
      trigger={(props) => (
        <button type="button" {...props} className="rounded-full transition-shadow hover:ring-4 hover:ring-slate-100" aria-label="Account menu">
          <Avatar src={profile?.avatar_url} name={name} size="sm" />
        </button>
      )}
      items={[
        { label: 'My profile', icon: UserRound, onClick: () => navigate('/profile') },
        { label: 'AI Assistant', icon: Sparkles, onClick: () => navigate('/ai') },
        { label: 'Settings', icon: Settings, onClick: () => navigate('/settings') },
        { label: 'Admin Dashboard', icon: LayoutDashboard, onClick: () => navigate('/admin'), hidden: !isAdmin },
        { divider: true },
        { label: 'Log out', icon: LogOut, onClick: logout, danger: true },
      ]}
    />
  );
}
