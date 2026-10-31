import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { parseApiError } from '../utils/apiError';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';

function Forbidden() {
  return (
    <div className="card">
      <EmptyState
        icon={ShieldAlert}
        title="Admins only"
        description="You don't have permission to view this page."
        action={
          <Link to="/" className="link text-sm">
            Back to home
          </Link>
        }
      />
    </div>
  );
}

/**
 * Hides admin pages from non-admins (UX only). The role is then confirmed with
 * GET /admin/test; every admin endpoint is still authorized by the backend.
 */
export default function AdminRoute() {
  const { isAdmin, user } = useAuth();
  const [check, setCheck] = useState({ status: 'checking', error: null });

  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;
    setCheck({ status: 'checking', error: null });
    adminService
      .test()
      .then(() => !cancelled && setCheck({ status: 'granted', error: null }))
      .catch((error) => {
        if (cancelled) return;
        const parsed = parseApiError(error);
        setCheck({ status: parsed.status === 403 ? 'denied' : 'error', error: parsed.message });
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, user?.id]);

  if (!isAdmin || check.status === 'denied') return <Forbidden />;
  if (check.status === 'checking') {
    return (
      <div className="flex justify-center py-20 text-brand-600">
        <Spinner label="Checking permissions" />
      </div>
    );
  }
  if (check.status === 'error') return <ErrorState message={check.error} onRetry={() => window.location.reload()} />;
  return <Outlet />;
}
