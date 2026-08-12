import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { getSafeReturnUrl } from './centralAuth';

export function CentralLogoutPage() {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const returnUrl = getSafeReturnUrl(location.search, '/apps');
    signOut();
    navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`, { replace: true });
  }, [location.search, navigate, signOut]);

  return <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Signing out" />;
}
