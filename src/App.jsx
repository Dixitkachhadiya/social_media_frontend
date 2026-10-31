import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';

// Development-only LOCAL/LIVE backend switcher. In production builds import.meta.env.DEV is false,
// so this branch and the component's code are removed from the bundle entirely.
const ApiEnvironmentSwitcher = import.meta.env.DEV ? lazy(() => import('./components/dev/ApiEnvironmentSwitcher')) : null;

// Keyed by the signed-in user: when the identity changes, every page remounts, so no list,
// liked_by_me flag or form state from the previous account can leak into the new session.
function SessionRoutes() {
  const { user } = useAuth();
  return <AppRoutes key={user?.id ?? 'guest'} />;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <SessionRoutes />
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 4000,
            className: '!text-sm !text-ink !rounded-xl !shadow-pop !border !border-line',
            success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
          }}
        />
        {ApiEnvironmentSwitcher && (
          <Suspense fallback={null}>
            <ApiEnvironmentSwitcher />
          </Suspense>
        )}
      </SocketProvider>
    </AuthProvider>
  );
}
