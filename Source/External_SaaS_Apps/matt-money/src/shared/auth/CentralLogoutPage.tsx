import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { getRequestedClientId, getSafeReturnUrl } from './centralAuth';

export function CentralLogoutPage() {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const clientId = getRequestedClientId(location.search);
    const returnUrl = getSafeReturnUrl(location.search, '/apps');
    signOut();

    const params = new URLSearchParams({ client_id: clientId, returnUrl });
    if (clientId === 'platform') params.set('entry', 'platform');
    navigate(`/login?${params.toString()}`, { replace: true });
  }, [location.search, navigate, signOut]);

  return <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Signing out" />;
}
