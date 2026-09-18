import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { getRequestedClientId, getSafeReturnUrl, storeCentralAuthHandoff } from '../utils/authenticationHelpers';

const LogoutPage = () => {
  //#region Hooks
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handled = useRef(false);
  //#endregion

  //#region Effects
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const clientId = getRequestedClientId(location.search);
    const returnUrl = getSafeReturnUrl(location.search, '/apps');
    signOut();

    // Handed off via sessionStorage instead of re-appended to the URL — this hop to /login is
    // same-origin (a plain react-router navigate), so the next page can read it back without
    // either value ever sitting in the address bar or an access log.
    storeCentralAuthHandoff({ clientId, returnUrl });
    navigate(clientId === 'platform' ? '/login?entry=platform' : '/login', { replace: true });
  }, [location.search, navigate, signOut]);
  //#endregion

  //#region Render
  return <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Signing out" />;
  //#endregion
};

export default LogoutPage;
