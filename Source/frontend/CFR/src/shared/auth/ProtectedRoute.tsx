import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { storeCentralAuthHandoff } from './centralAuth';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) return <Outlet />;

  // Handed off via sessionStorage instead of the URL — this redirect to /login is same-origin
  // (a plain react-router Navigate), so CentralLoginPage can read it back without it sitting in
  // the address bar or an access log.
  const localReturnUrl = `${location.pathname}${location.search}${location.hash}`;
  storeCentralAuthHandoff({ returnUrl: localReturnUrl });
  return <Navigate to="/login" replace />;
}
