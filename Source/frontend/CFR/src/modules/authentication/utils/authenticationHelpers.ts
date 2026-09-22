import { environment } from '@shared/platform/config/environment';
import { SOLUTION_REGISTRY, type SolutionId } from '@shared/platform/config/solutionRegistry';

const PREVIEW_SESSION_COOKIE = 'cs_platform_preview_session';
const RELATIVE_RESOLUTION_BASE = 'https://return-url.invalid';
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

export function isKnownSolutionId(value: string | null): value is SolutionId {
  return Boolean(value && value in SOLUTION_REGISTRY);
}

const HANDOFF_STORAGE_KEY = 'cs_central_auth_handoff';

interface CentralAuthHandoff {
  clientId?: string;
  returnUrl?: string;
}

/**
 * Carries client_id/returnUrl between same-origin pages in this login/forgot-password/
 * reset-password chain without putting them back in the URL on every hop (a query string gets
 * written to server/proxy access logs and browser history on each navigation). This only works
 * within one origin, so it's a fallback used by getRequestedClientId/getSafeReturnUrl when the
 * query string doesn't have them — a genuinely cross-origin arrival (e.g. a redirect from
 * another app's domain) still must carry them in the URL, and is read from `search` first.
 */
function readCentralAuthHandoff(): CentralAuthHandoff {
  try {
    const raw = typeof window === 'undefined' ? null : window.sessionStorage.getItem(HANDOFF_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CentralAuthHandoff) : {};
  } catch {
    return {};
  }
}

export function storeCentralAuthHandoff(handoff: CentralAuthHandoff): void {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(HANDOFF_STORAGE_KEY, JSON.stringify(handoff));
  } catch {
    // Storage unavailable (private browsing, quota, etc.) — the caller falls back to whatever
    // it already had in the URL/query string for this one navigation.
  }
}

export function getRequestedClientId(search: string): SolutionId {
  const fromQuery = new URLSearchParams(search).get('client_id');
  if (isKnownSolutionId(fromQuery)) return fromQuery;
  const stashed = readCentralAuthHandoff().clientId ?? null;
  return isKnownSolutionId(stashed) ? stashed : 'platform';
}

export function getSafeReturnUrl(search: string, fallback = '/apps') {
  const value = new URLSearchParams(search).get('returnUrl') ?? readCentralAuthHandoff().returnUrl;
  if (!value || HAS_SCHEME.test(value)) return fallback;

  let url: URL;
  try { url = new URL(value, RELATIVE_RESOLUTION_BASE); } catch { return fallback; }

  return url.origin === RELATIVE_RESOLUTION_BASE ? `${url.pathname}${url.search}${url.hash}` : fallback;
}

export function toAbsoluteReturnUrl(returnUrl: string) {
  if (/^https?:\/\//i.test(returnUrl)) return returnUrl;
  const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  return new URL(returnUrl, base).toString();
}

export function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function cookieAttributes(expire = false, remember = false) {
  const attributes = ['Path=/', 'SameSite=Lax'];
  if (environment.sessionCookieDomain) attributes.push(`Domain=${environment.sessionCookieDomain}`);
  if (environment.mode !== 'development') attributes.push('Secure');
  if (expire) attributes.push('Max-Age=0');
  else if (remember) attributes.push('Max-Age=604800');
  return attributes.join('; ');
}

export function hasPreviewSession() {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((part) => part.trim().startsWith(`${PREVIEW_SESSION_COOKIE}=`));
}

export function createPreviewSession(remember = true) {
  if (typeof document === 'undefined') return;
  document.cookie = `${PREVIEW_SESSION_COOKIE}=1; ${cookieAttributes(false, remember)}`;
}

export function clearPreviewSession() {
  if (typeof document === 'undefined') return;
  document.cookie = `${PREVIEW_SESSION_COOKIE}=; ${cookieAttributes(true)}`;
  document.cookie = `${PREVIEW_SESSION_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`;
}
