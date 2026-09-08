import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { environment } from '@shared/platform/config/environment';
import { useAuth } from './AuthProvider';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) return <Outlet />;

  const localReturnUrl = `${location.pathname}${location.search}${location.hash}`;
  const params = new URLSearchParams({ client_id: environment.appId, returnUrl: localReturnUrl });
  return <Navigate to={`/login?${params.toString()}`} replace />;
}
