export const GATEWAY_PORTAL_API_PATH = '/portal/api/v1/';
export const API_BASE_URL = import.meta.env.VITE_APP_REST_API_BASE_URL;
const PORTAL_TOKEN_KEY = 'cfr_portal_token';
const PORTAL_USER_KEY = 'cfr_portal_user';

export interface PortalSessionUser {
  userId: number;
  eMail: string;
  firstName: string;
  lastName: string;
}

export function getPortalToken(): string {
  if (typeof sessionStorage === 'undefined') return '';
  return sessionStorage.getItem(PORTAL_TOKEN_KEY) ?? '';
}

export function getPortalSessionUser(): PortalSessionUser | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(PORTAL_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PortalSessionUser;
  } catch {
    return null;
  }
}

export function setPortalSession(token: string, user: PortalSessionUser) {
  sessionStorage.setItem(PORTAL_TOKEN_KEY, token);
  sessionStorage.setItem(PORTAL_USER_KEY, JSON.stringify(user));
}

export function clearPortalSession() {
  sessionStorage.removeItem(PORTAL_TOKEN_KEY);
  sessionStorage.removeItem(PORTAL_USER_KEY);
}

function resolveUrl(endpoint: string): string {
  const origin = String(API_BASE_URL).replace(/\/+$/, '');
  return `${origin}${GATEWAY_PORTAL_API_PATH}${endpoint.replace(/^\/+/, '')}`;
}

function readField(source: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return undefined;
}

function toApiEnvelope(body: unknown, fallbackStatus = 200): Record<string, unknown> {
  if (!body || typeof body !== 'object') {
    return { statusCode: fallbackStatus, statusMessage: '', resultData: body ?? null };
  }
  const source = body as Record<string, unknown>;
  return {
    ...source,
    statusCode: Number(readField(source, 'statusCode', 'StatusCode') ?? fallbackStatus),
    statusMessage: String(readField(source, 'statusMessage', 'StatusMessage') ?? ''),
    resultData: readField(source, 'resultData', 'ResultData') ?? null,
  };
}

async function parseResponse(response: Response): Promise<Record<string, unknown>> {
  if (response.status === 204) {
    return { statusCode: 204, statusMessage: 'No record found.', resultData: [] };
  }

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  const envelope = toApiEnvelope(body, response.status);
  if (!response.ok) {
    throw String(envelope.statusMessage || `API error: ${response.status}`);
  }
  return envelope;
}

function authHeaders(extra?: Record<string, string>): HeadersInit {
  const token = getPortalToken();
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function getPortalApi(endpoint: string, params?: Record<string, string>): Promise<Record<string, unknown>> {
  const url = new URL(resolveUrl(endpoint));
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseResponse(response);
}

export async function postPortalApi(endpoint: string, payload: unknown): Promise<Record<string, unknown>> {
  const url = new URL(resolveUrl(endpoint)).toString();
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}
