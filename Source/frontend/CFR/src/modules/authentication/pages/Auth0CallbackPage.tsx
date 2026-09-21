import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AUTH0_POST_LOGIN_PATH,
  exchangeAuth0TokenForPortalSession,
  persistAuth0Session,
} from '../utils/auth0Session';

const Auth0CallbackPage = () => {
  //#region Hooks
  const { isLoading, isAuthenticated, getAccessTokenSilently, user, error } = useAuth0();
  const navigate = useNavigate();
  const handled = useRef(false);
  //#endregion

  //#region Effects
  useEffect(() => {
    if (isLoading || handled.current) return;

    if (error || !isAuthenticated) {
      navigate('/login?entry=platform', { replace: true });
      return;
    }

    handled.current = true;
    void (async () => {
      try {
        const auth0AccessToken = await getAccessTokenSilently();
        if (!auth0AccessToken) {
          throw new Error('Auth0 session is incomplete.');
        }
        // Exchange for a CFR-signed Portal JWT - the raw Auth0 token is never
        // sent to CFR.Portal's own [Authorize] endpoints directly.
        const { token, user: portalUser } = await exchangeAuth0TokenForPortalSession(auth0AccessToken);
        persistAuth0Session(token, portalUser);
        window.location.replace(AUTH0_POST_LOGIN_PATH);
      } catch {
        handled.current = false;
        navigate('/login?entry=platform', { replace: true });
      }
    })();
  }, [error, getAccessTokenSilently, isAuthenticated, isLoading, navigate, user]);
  //#endregion

  //#region Render
  return <div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="Completing Auth0 sign in" />;
  //#endregion
};

export default Auth0CallbackPage;
