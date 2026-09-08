import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) return <Outlet />;

  const localReturnUrl = `${location.pathname}${location.search}${location.hash}`;
  return <Navigate to={`/login?returnUrl=${encodeURIComponent(localReturnUrl)}`} replace />;
}
