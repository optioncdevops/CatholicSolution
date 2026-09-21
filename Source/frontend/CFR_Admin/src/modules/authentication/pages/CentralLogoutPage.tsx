import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { getRequestedClientId } from '../utils/centralAuth';

export function CentralLogoutPage() {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    // client_id/returnUrl are read only to decide `entry` below — this app's own CentralLoginPage
    // never reads either of them itself (it always renders the fixed Admin sign-in experience and
    // hardcodes its own post-login destination), so neither needs to travel in the outgoing URL.
    const clientId = getRequestedClientId(location.search);
    signOut();

    navigate(clientId === 'platform' ? '/login?entry=platform' : '/login', { replace: true });
  }, [location.search, navigate, signOut]);

  return <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Signing out" />;
}
