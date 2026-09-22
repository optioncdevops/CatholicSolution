import { setPortalSession, type PortalSessionUser } from '@app/config/appPortalClient';
import { createPreviewSession } from './authenticationHelpers';

const AUTH0_SESSION_FLAG = 'cfr_auth0_session';

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
}

export function persistAuth0Session(token: string, user: PortalSessionUser, remember = true) {
  setPortalSession(token, user);
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
