import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageSpinner } from '../components/common/Spinner';

// Login/register/forgot-password: logged-in users are sent back to where they came from
export default function GuestRoute() {
  const { status, landingPath } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'authenticated') return <Navigate to={landingPath || location.state?.from || '/'} replace />;
  return <Outlet />;
}
