import { environment } from '@shared/platform/config/environment';
import { SOLUTION_REGISTRY, type SolutionId } from '@shared/platform/config/solutionRegistry';

const PREVIEW_SESSION_COOKIE = 'cs_platform_preview_session';
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

function cookieAttributes(expire = false, remember = false) {
  const attributes = ['Path=/', 'SameSite=Lax'];
  if (environment.sessionCookieDomain) attributes.push(`Domain=${environment.sessionCookieDomain}`);
  if (environment.mode === 'production') attributes.push('Secure');
  if (expire) attributes.push('Max-Age=0');
  else if (remember) attributes.push('Max-Age=604800');
  return attributes.join('; ');
}

export function hasPreviewSession() {
  if (typeof document === 'undefined' || environment.authMode === 'sso') return false;
  return document.cookie.split(';').some((part) => part.trim().startsWith(`${PREVIEW_SESSION_COOKIE}=`));
}

export function createPreviewSession(remember = true) {
  if (typeof document === 'undefined' || environment.authMode === 'sso') return;
  document.cookie = `${PREVIEW_SESSION_COOKIE}=1; ${cookieAttributes(false, remember)}`;
}

export function clearPreviewSession() {
  if (typeof document === 'undefined') return;
  document.cookie = `${PREVIEW_SESSION_COOKIE}=; ${cookieAttributes(true)}`;
  // Also clear a host-only copy left by older/local builds.
  document.cookie = `${PREVIEW_SESSION_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`;
}

export function canRedirectToExternalIdentityProvider() {
  if (!environment.authOrigin) return false;
  return normalizedOrigin(environment.authOrigin) !== normalizedOrigin(environment.loginOrigin);
}
