import type { PortalSessionUser } from '@app/config/appPortalClient';
import type { SignInProvider } from '../types/authenticationTypes';
import { exchangeAuth0TokenForPortalSession, persistAuth0Session } from '../utils/auth0Session';

interface Auth0TokenResponse {
  access_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

function auth0Domain() {
  return (import.meta.env.VITE_AUTH0_DOMAIN ?? '').trim();
}

function auth0ClientId() {
  return (import.meta.env.VITE_AUTH0_CLIENT_ID ?? '').trim();
}

export function getAuth0DatabaseConnection() {
  return (import.meta.env.VITE_AUTH0_DB_CONNECTION ?? 'Username-Password-Authentication').trim();
}

export function getAuth0SocialConnection(provider: Exclude<SignInProvider, 'password'>) {
  if (provider === 'google') {
    return (import.meta.env.VITE_AUTH0_GOOGLE_CONNECTION ?? 'google-oauth2').trim();
  }
  return (import.meta.env.VITE_AUTH0_MICROSOFT_CONNECTION ?? 'windowslive').trim();
}

export const loginAuth0Password = async (email: string, password: string, remember = true): Promise<PortalSessionUser> => {
  const domain = auth0Domain();
  const clientId = auth0ClientId();
  if (!domain || !clientId) {
    throw 'Auth0 is not configured.';
  }

  const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      username: email,
      password,
      client_id: clientId,
      realm: getAuth0DatabaseConnection(),
      scope: 'openid profile email',
    }),
  });

  const body = (await response.json().catch(() => ({}))) as Auth0TokenResponse;
  if (!response.ok) {
    throw String(body.error_description || body.error || 'Invalid email or password.');
  }

  const auth0AccessToken = String(body.access_token ?? '').trim();
  if (!auth0AccessToken) {
    throw 'Invalid email or password.';
  }

  // Exchange for a CFR-signed Portal JWT - the raw Auth0 token is never sent
  // to CFR.Portal's own [Authorize] endpoints directly (same fix as the
  // Google/Microsoft redirect path in Auth0CallbackPage.tsx).
  const { token, user: sessionUser } = await exchangeAuth0TokenForPortalSession(auth0AccessToken);
  persistAuth0Session(token, sessionUser, remember);
  return sessionUser;
};
