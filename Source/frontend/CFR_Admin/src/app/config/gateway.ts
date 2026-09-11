/**
 * Env only holds the gateway origin (e.g. https://localhost:5050).
 * Service prefixes live here so every API call goes through CFR.Gateway as
 * /{service}/api/v1/{controller}/{action}. Add a key when a new microservice is published.
 */
export const GATEWAY_API_VERSION = 'api/v1';

export const GATEWAY_SERVICES = {
  acutis: 'acutis',
  portal: 'portal',
} as const;

export type GatewayServiceName = keyof typeof GATEWAY_SERVICES;

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

const GATEWAY_SERVICE_SUFFIX = new RegExp(
  `\\/(${Object.values(GATEWAY_SERVICES).map(trimSlashes).join('|')})$`,
  'i',
);

const API_BASE_URL_VAR_NAME = 'VITE_APP_REST_API_BASE_URL';

/**
 * Fail-fast guard (production-readiness H3): a missing/blank/malformed base URL must never
 * silently degrade into relative requests against the frontend's own origin — that failure mode
 * (every API call quietly 404s/502s with no diagnostic context) is exactly what took multiple
 * rounds of live production debugging to track down before this check existed. Throwing here, at
 * the first read of the origin (which happens at module-eval time via AxiosInstance.ts's
 * `axios.create({ baseURL: getAcutisApiBaseUrl() })`), makes a misconfigured deploy fail loudly
 * at app startup instead of shipping a silently-broken build.
 */
function assertValidGatewayOrigin(origin: string): void {
  if (!origin) {
    throw new Error(
      `${API_BASE_URL_VAR_NAME} is missing or empty. Set it to the Gateway origin for this ` +
      'environment (e.g. https://localhost:5050 for development, or the deployed Gateway\'s ' +
      `https:// origin) in the matching .env.{mode} file before building or running the app.`,
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error(
      `${API_BASE_URL_VAR_NAME} ("${origin}") is not a valid absolute URL. It must be a full ` +
      'http(s) origin, e.g. https://cfrapi.allnewoptionc.com or http://localhost:5050 — not a ' +
      'relative path or bare hostname.',
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(
      `${API_BASE_URL_VAR_NAME} ("${origin}") must use the http or https scheme, got ` +
      `"${parsed.protocol}".`,
    );
  }
}

// Production-readiness H1: no isolated staging backend exists yet (see .env.staging's own
// comment) — a `staging`-mode build currently talks to the exact same origin as `live`. This is
// not a bug this file can fix (there is no separate staging URL to invent — see the review's
// explicit "never invent an API URL" instruction), but a staging build silently behaving like a
// safe, isolated test environment is dangerous, so this logs an unmissable startup warning
// whenever that specific condition is detected, rather than staying silent about it.
const KNOWN_LIVE_ORIGIN = 'https://cfrapi.allnewoptionc.com';
let hasWarnedAboutStagingSharingLiveBackend = false;

function warnIfStagingSharesLiveBackend(mode: string, origin: string): void {
  if (hasWarnedAboutStagingSharingLiveBackend) return;
  if (mode === 'staging' && origin === KNOWN_LIVE_ORIGIN) {
    hasWarnedAboutStagingSharingLiveBackend = true;
    console.warn(
      '[cfr-admin] This "staging" build is configured to use the LIVE backend ' +
      `(${KNOWN_LIVE_ORIGIN}). There is no isolated staging API yet, so every request this build ` +
      'makes reads/writes real production data. Do not use this build for exploratory, ' +
      'destructive, or load testing — see .env.staging for details.',
    );
  }
}

export function getGatewayOrigin(): string {
  const origin = String(import.meta.env.VITE_APP_REST_API_BASE_URL ?? '')
    .replace(/\/+$/, '')
    .replace(GATEWAY_SERVICE_SUFFIX, '');
  assertValidGatewayOrigin(origin);
  warnIfStagingSharesLiveBackend(import.meta.env.MODE, origin);
  return origin;
}

export function getGatewayServicePrefix(service: GatewayServiceName): string {
  return `/${trimSlashes(GATEWAY_SERVICES[service])}`;
}

export function getGatewayServiceApiPath(service: GatewayServiceName): string {
  return `/${trimSlashes(GATEWAY_SERVICES[service])}/${trimSlashes(GATEWAY_API_VERSION)}/`;
}

export function getServiceApiBaseUrl(service: GatewayServiceName): string {
  const origin = getGatewayOrigin();
  const path = getGatewayServiceApiPath(service);
  return origin ? `${origin}${path}` : path;
}

export function getServicePublicUrl(service: GatewayServiceName, path: string): string {
  const origin = getGatewayOrigin();
  const prefix = getGatewayServicePrefix(service);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return origin ? `${origin}${prefix}${cleanPath}` : `${prefix}${cleanPath}`;
}

export const GATEWAY_API_PATH = getGatewayServiceApiPath('acutis');
export const GATEWAY_ACUTIS_PATH = getGatewayServicePrefix('acutis');
export const GATEWAY_PORTAL_API_PATH = getGatewayServiceApiPath('portal');

export function getAcutisApiBaseUrl(): string {
  return getServiceApiBaseUrl('acutis');
}

export function getPortalApiBaseUrl(): string {
  return getServiceApiBaseUrl('portal');
}

export function getAcutisPublicUrl(path: string): string {
  return getServicePublicUrl('acutis', path);
}
