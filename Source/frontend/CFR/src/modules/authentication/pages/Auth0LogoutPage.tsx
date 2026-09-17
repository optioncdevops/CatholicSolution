import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthProvider';
import { clearAuth0SessionFlag } from '../utils/auth0Session';

const Auth0LogoutPage = () => {
  //#region Hooks
  const { logout } = useAuth0();
  const { signOut } = useAuth();
  const handled = useRef(false);
  //#endregion

  //#region Effects
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    signOut();
    clearAuth0SessionFlag();
    logout({ logoutParams: { returnTo: window.location.origin } });
  }, [logout, signOut]);
  //#endregion

  //#region Render
  return <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Signing out of Auth0" />;
  //#endregion
};

export default Auth0LogoutPage;
