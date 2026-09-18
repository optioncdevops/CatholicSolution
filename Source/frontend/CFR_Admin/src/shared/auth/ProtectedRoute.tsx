import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Outlet />;

  // client_id/returnUrl dropped: this app's own CentralLoginPage never reads either of them —
  // it always renders the fixed Admin sign-in experience and always lands back on /admin after
  // signing in, never wherever the user happened to be before their session expired (see
  // CentralLoginPage.tsx). `entry=platform` is the only param that route actually consumes, to
  // require an interactive sign-in rather than silently completing from a stale session.
  return <Navigate to="/login?entry=platform" replace />;
}
