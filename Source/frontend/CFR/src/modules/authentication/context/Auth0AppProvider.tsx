import { Auth0Provider } from '@auth0/auth0-react';
import type { PropsWithChildren } from 'react';
import { AUTH0_CALLBACK_PATH, isAuth0CallbackPath } from '../utils/auth0Session';

export function Auth0AppProvider({ children }: PropsWithChildren) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN ?? '';
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID ?? '';
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const skipRedirectCallback = typeof window === 'undefined' || !isAuth0CallbackPath(window.location.pathname);

  if (!domain || !clientId) {
    return children;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      // localstorage (not the default 'memory') so a freshly-loaded page - e.g.
      // the app-switcher widget's hidden session-check iframe - can read the
      // cached session via the SDK's own cache-only API. Tradeoff: the token is
      // then readable by any script on this page (more XSS-exposed than
      // memory-only caching) - accepted deliberately for the app switcher.
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: `${origin}${AUTH0_CALLBACK_PATH}`,
      }}
      skipRedirectCallback={skipRedirectCallback}
      onRedirectCallback={() => {
        window.history.replaceState({}, document.title, AUTH0_CALLBACK_PATH);
      }}
    >
      {children}
    </Auth0Provider>
  );
}
