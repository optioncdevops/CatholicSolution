import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { storeCentralAuthHandoff } from '../utils/authenticationHelpers';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // A platform-launch code (e.g. from the App Switcher's "All apps in App Hub" link) is this
  // tab's only proof of identity so far - the destination page exchanges it for a real session
  // itself. Let it through here; an invalid/expired code just means that exchange fails and the
  // page's own error handling takes over, same as any other failed sign-in.
  const hasPlatformLaunchCode = Boolean(new URLSearchParams(location.search).get('code'));
  if (isAuthenticated || hasPlatformLaunchCode) return <Outlet />;

  // Handed off via sessionStorage instead of the URL — this redirect to /login is same-origin
  // (a plain react-router Navigate), so CentralLoginPage can read it back without it sitting in
  // the address bar or an access log.
  const localReturnUrl = `${location.pathname}${location.search}${location.hash}`;
  storeCentralAuthHandoff({ returnUrl: localReturnUrl });
  return <Navigate to="/login" replace />;
}
