import type { PortalSessionUser } from '@app/config/appPortalClient';
import type { SignInProvider } from '../types/authenticationTypes';
import { persistAuth0Session, toPortalUserFromAuth0 } from '../utils/auth0Session';

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

function readIdTokenClaims(idToken: string): Record<string, unknown> {
  const part = idToken.split('.')[1];
  if (!part) return {};
  const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
  try {
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return {};
  }
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

  const token = String(body.access_token ?? '').trim();
  if (!token) {
    throw 'Invalid email or password.';
  }

  const claims = body.id_token ? readIdTokenClaims(body.id_token) : {};
  const sessionUser = toPortalUserFromAuth0(
    String(claims.email ?? email).trim(),
    typeof claims.given_name === 'string' ? claims.given_name : undefined,
    typeof claims.family_name === 'string' ? claims.family_name : undefined,
    typeof claims.name === 'string' ? claims.name : undefined,
    typeof claims.sub === 'string' ? claims.sub : undefined,
  );
  persistAuth0Session(token, sessionUser, remember);
  return sessionUser;
};
