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

export function getGatewayOrigin(): string {
  return String(import.meta.env.VITE_APP_REST_API_BASE_URL ?? '')
    .replace(/\/+$/, '')
    .replace(GATEWAY_SERVICE_SUFFIX, '');
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
