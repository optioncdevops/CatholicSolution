import { postPortalApi, setPortalSession, type PortalSessionUser } from '@app/config/appPortalClient';
import { createPreviewSession } from './authenticationHelpers';

const AUTH0_SESSION_FLAG = 'cfr_auth0_session';

/**
 * Dedicated, narrow-purpose localStorage key holding the CFR-issued Portal JWT
 * (never the raw Auth0 token). Deliberately separate from the app's own
 * sessionStorage-based session (cfr_portal_token/cfr_portal_user) - sessionStorage
 * is scoped per-tab and invisible to a hidden iframe opened from a different
 * top-level page (e.g. the app-switcher widget embedded in an external product),
 * whereas localStorage is shared across same-origin tabs/iframes. Read by
 * src/widget/sessionCheck.ts.
 */
const APP_SWITCHER_SESSION_KEY = 'cfr_app_switcher_session';

function persistAppSwitcherSessionToken(token: string) {
  try {
    localStorage.setItem(APP_SWITCHER_SESSION_KEY, token);
  } catch {
    // Storage unavailable (private browsing, quota, etc.) - the app-switcher
    // widget simply won't find a session for this browser; not fatal.
  }
}

function clearAppSwitcherSessionToken() {
  try {
    localStorage.removeItem(APP_SWITCHER_SESSION_KEY);
  } catch {
    // ignore
  }
}

/**
 * Exchanges a verified Auth0 access token for a CFR Portal session JWT.
 * The raw Auth0 token is signed with Auth0's key, not CFR's, so it is never
 * usable directly against CFR.Portal's own [Authorize] endpoints - this call
 * is what actually authenticates the member against CFR itself.
 */
export async function exchangeAuth0TokenForPortalSession(
  auth0AccessToken: string,
): Promise<{ token: string; user: PortalSessionUser }> {
  const response = await postPortalApi('PortalLogin/ExchangeAuth0Token', { accessToken: auth0AccessToken });
  const statusCode = Number(response.statusCode ?? 200);
  if (statusCode >= 400) {
    throw String(response.statusMessage || 'Unable to verify Auth0 session with CFR.');
  }

  const resultData = (response.resultData ?? {}) as Record<string, unknown>;
  const user = (resultData.user ?? resultData.User) as
    | (PortalSessionUser & { token?: string })
    | undefined;
  if (!user || !user.token) {
    throw 'CFR did not return a session for this Auth0 identity.';
  }

  return { token: user.token, user };
}

export const AUTH0_CALLBACK_PATH = '/auth-callback';
export const AUTH0_LOGIN_PATH = '/auth-login';
export const AUTH0_LOGOUT_PATH = '/auth-logout';
export const AUTH0_POST_LOGIN_PATH = '/apps';

export function isAuth0CallbackPath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return normalized === AUTH0_CALLBACK_PATH;
}

export function markAuth0Session() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(AUTH0_SESSION_FLAG, '1');
}

export function isAuth0Session() {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(AUTH0_SESSION_FLAG) === '1';
}

export function clearAuth0SessionFlag() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(AUTH0_SESSION_FLAG);
  clearAppSwitcherSessionToken();
}

export function persistAuth0Session(token: string, user: PortalSessionUser, remember = true) {
  setPortalSession(token, user);
  persistAppSwitcherSessionToken(token);
  markAuth0Session();
  createPreviewSession(remember);
}

export function userIdFromSubject(subject: string) {
  let hash = 0;
  for (let index = 0; index < subject.length; index += 1) {
    hash = (hash * 31 + subject.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) || 1;
}

export function toPortalUserFromAuth0(
  email: string,
  givenName?: string,
  familyName?: string,
  fullName?: string,
  subject?: string,
): PortalSessionUser {
  const nameParts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
  const firstName = (givenName ?? nameParts[0] ?? '').trim();
  const lastName = (familyName ?? nameParts.slice(1).join(' ') ?? '').trim();
  return {
    userId: userIdFromSubject(subject || email),
    eMail: email,
    firstName,
    lastName,
  };
}
