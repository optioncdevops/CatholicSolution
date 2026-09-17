import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { getRequestedClientId, getSafeReturnUrl } from '../utils/authenticationHelpers';

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

    const params = new URLSearchParams({ client_id: clientId, returnUrl });
    if (clientId === 'platform') params.set('entry', 'platform');
    navigate(`/login?${params.toString()}`, { replace: true });
  }, [location.search, navigate, signOut]);
  //#endregion

  //#region Render
  return <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Signing out" />;
  //#endregion
};

export default LogoutPage;
