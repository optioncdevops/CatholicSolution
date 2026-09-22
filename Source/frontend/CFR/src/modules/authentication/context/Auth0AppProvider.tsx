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
