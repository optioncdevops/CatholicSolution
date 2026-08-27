import { environment } from '@shared/platform/config/environment';
import { SOLUTION_REGISTRY, type SolutionId } from '@shared/platform/config/solutionRegistry';

const ACUTIS_SESSION_STORAGE_KEY = 'cs_acutis_session_token';
const RELATIVE_RESOLUTION_BASE = 'https://return-url.invalid';
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function normalizedOrigin(value: string) {
  try { return new URL(value).origin; } catch { return ''; }
}

function configuredLoginOrigin() {
  return environment.loginOrigin || environment.origins.platform;
}

function configuredOrigins() {
  return Object.values(environment.origins).map(normalizedOrigin).filter(Boolean);
}

export function isKnownSolutionId(value: string | null): value is SolutionId {
  return Boolean(value && value in SOLUTION_REGISTRY);
}

export function getRequestedClientId(search: string): SolutionId {
  const value = new URLSearchParams(search).get('client_id');
  return isKnownSolutionId(value) ? value : 'platform';
}

export function getSafeReturnUrl(search: string, fallback = '/apps') {
  const value = new URLSearchParams(search).get('returnUrl');
  if (!value) return fallback;

  let url: URL;
  try { url = new URL(value, RELATIVE_RESOLUTION_BASE); } catch { return fallback; }

  if (!HAS_SCHEME.test(value)) {
    return url.origin === RELATIVE_RESOLUTION_BASE ? `${url.pathname}${url.search}${url.hash}` : fallback;
  }

  return configuredOrigins().includes(url.origin) ? url.toString() : fallback;
}

export function toAbsoluteReturnUrl(returnUrl: string) {
  if (/^https?:\/\//i.test(returnUrl)) return returnUrl;
  const base = environment.origins.platform || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  return new URL(returnUrl, base).toString();
}

export function buildCentralLoginUrl(returnUrl?: string) {
  const origin = configuredLoginOrigin();
  if (!origin || typeof window === 'undefined') return '';
  const url = new URL('/login', origin);
  url.searchParams.set('client_id', environment.appId);
  url.searchParams.set('returnUrl', returnUrl || window.location.href);
  return url.toString();
}

export function buildCentralLogoutUrl(returnUrl?: string) {
  const origin = configuredLoginOrigin();
  if (!origin || typeof window === 'undefined') return '';
  const url = new URL('/logout', origin);
  url.searchParams.set('client_id', environment.appId);
  url.searchParams.set('returnUrl', returnUrl || window.location.href);
  return url.toString();
}

/**
 * Real session storage — the identity CFR.Acutis's `/Auth/Login` actually returned (JWT + user
 * fields), not a mock/preview marker. `localStorage`-backed (not a cookie) since it's only ever
 * read by this SPA's own fetch calls (`Authorization: Bearer`), never by the server via cookie.
 */
export interface StoredAcutisSession {
  token: string;
  userId: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  isSuperUser: boolean;
}

function isJwtExpired(token: string): boolean {
  try {
    const payloadSegment = token.split('.')[1];
    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(normalized)) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true; // Malformed token — treat as expired/invalid rather than trusting it.
  }
}

export function getStoredAcutisSession(): StoredAcutisSession | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ACUTIS_SESSION_STORAGE_KEY);
  if (!raw) return null;

  let session: StoredAcutisSession;
  try {
    session = JSON.parse(raw) as StoredAcutisSession;
  } catch {
    window.localStorage.removeItem(ACUTIS_SESSION_STORAGE_KEY);
    return null;
  }

  if (!session.token || isJwtExpired(session.token)) {
    window.localStorage.removeItem(ACUTIS_SESSION_STORAGE_KEY);
    return null;
  }
  return session;
}

export function storeAcutisSession(session: StoredAcutisSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACUTIS_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearAcutisToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACUTIS_SESSION_STORAGE_KEY);
}

export function hasAcutisSession() {
  return getStoredAcutisSession() !== null;
}

export function canRedirectToExternalIdentityProvider() {
  if (!environment.authOrigin) return false;
  return normalizedOrigin(environment.authOrigin) !== normalizedOrigin(environment.loginOrigin);
}
