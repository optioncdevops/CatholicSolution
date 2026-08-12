import { environment } from '@shared/platform/config/environment';
import { SOLUTION_REGISTRY, type SolutionId } from '@shared/platform/config/solutionRegistry';

const DEV_CALLBACK_PARAM = '__cs_dev_auth';

function configuredLoginOrigin() {
  return environment.loginOrigin || environment.origins.platform;
}

function configuredOrigins() {
  return Object.values(environment.origins)
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return '';
      }
    })
    .filter(Boolean);
}

export function isKnownSolutionId(value: string | null): value is SolutionId {
  return Boolean(value && value in SOLUTION_REGISTRY);
}

export function getRequestedClientId(search: string): SolutionId {
  const value = new URLSearchParams(search).get('client_id');
  return isKnownSolutionId(value) ? value : 'platform';
}

/**
 * Reserved-TLD base (RFC 2606) used to resolve relative return URLs. It can never
 * collide with a configured solution origin, so "did this input introduce its own
 * authority?" reduces to a single origin comparison.
 */
const RELATIVE_RESOLUTION_BASE = 'https://return-url.invalid';
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Resolves the post-authentication destination, rejecting anything that is not either a
 * path on the current origin or an absolute URL on a configured Catholic Solutions
 * origin (specification §20).
 *
 * Both branches are decided by the WHATWG URL parser rather than by string prefixes,
 * because prefix checks miss authority smuggling: browsers fold a backslash into a
 * slash for special schemes, so `/\evil.com` passes a `startsWith('//')` test and then
 * navigates to `https://evil.com`. Resolving against a base and comparing origins
 * catches that, along with `//host`, encoded variants, and non-HTTP schemes such as
 * `javascript:` (whose origin is opaque and therefore never allowlisted).
 */
export function getSafeReturnUrl(search: string, fallback = '/apps') {
  const value = new URLSearchParams(search).get('returnUrl');
  if (!value) return fallback;

  let url: URL;
  try {
    url = new URL(value, RELATIVE_RESOLUTION_BASE);
  } catch {
    return fallback;
  }

  if (!HAS_SCHEME.test(value)) {
    // Same-origin path. If resolving it moved us off the neutral base, the input
    // carried its own authority and is not a relative path at all.
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
  url.searchParams.set('returnUrl', returnUrl || window.location.href);
  return url.toString();
}

export function addDevelopmentAuthCallback(returnUrl: string, remember = true) {
  const absolute = toAbsoluteReturnUrl(returnUrl);
  const url = new URL(absolute);
  url.searchParams.set(DEV_CALLBACK_PARAM, remember ? 'local' : 'session');
  return url.toString();
}

export function consumeDevelopmentAuthCallback(): 'local' | 'session' | null {
  if (typeof window === 'undefined' || environment.authMode !== 'mock' || environment.appId === 'platform') return null;
  const url = new URL(window.location.href);
  const mode = url.searchParams.get(DEV_CALLBACK_PARAM);
  if (mode !== 'local' && mode !== 'session') return null;
  url.searchParams.delete(DEV_CALLBACK_PARAM);
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  return mode;
}
