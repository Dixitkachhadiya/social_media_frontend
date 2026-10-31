import { WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import { LogoMark } from './Logo';
import { ACTIVE_API_MODE, BASE_URL, IS_DEV } from '../../config/apiConfig';

export default function ServerUnavailable() {
  const { retryConnection, logout } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <LogoMark className="mb-8 h-10 w-10" />
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-muted">
        <WifiOff className="h-5 w-5" aria-hidden="true" />
      </span>
      <h1 className="text-lg font-semibold">Can't reach the server</h1>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Your session is saved, but the backend isn't responding right now. Check your connection and try again.
      </p>
      {IS_DEV && (
        <p className="mt-3 rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-ink-soft">
          {ACTIVE_API_MODE} API: {BASE_URL}
        </p>
      )}
      <div className="mt-6 flex gap-2">
        <Button onClick={retryConnection}>Try again</Button>
        <Button variant="ghost" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
