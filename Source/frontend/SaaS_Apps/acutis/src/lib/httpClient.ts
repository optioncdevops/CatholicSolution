import { ApiError } from '@/modules/auth/api/authApi';

const BASE_URL = import.meta.env.VITE_APP_REST_API_BASE_URL;

/**
 * Set by AuthProvider on mount. Called for every 401 response from any request, regardless of
 * which screen triggered it — this is the single place session-expiry handling is wired, so every
 * API call gets it for free without each call site remembering to check.
 */
let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

/**
 * Called for every 403 response — distinct from 401 (missing/invalid/expired token): the caller
 * IS authenticated, just not permitted for this specific action. No Acutis endpoint returns 403
 * today (none has a role/permission gate beyond "authenticated or not" — see
 * docs/acutis-auth-spec/security-model.md), but this hook exists so the frontend already handles
 * it correctly the moment one does, rather than showing a generic error.
 */
let onForbidden: (() => void) | null = null;

export function registerForbiddenHandler(handler: () => void): void {
  onForbidden = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  token?: string | null;
  body?: unknown;
}

/**
 * Thin fetch wrapper. Never logs request/response bodies, headers, or the resolved URL's query
 * string — only a generic failure is logged (see catch block), so a token or password in a
 * request body is never written to the console even on failure.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token, body } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network-level failure (server down, CORS, etc.) — no request/response detail to leak.
    throw new ApiError('Unable to reach the server. Please try again.', 0);
  }

  if (response.status === 401) {
    onUnauthorized?.();
    throw new ApiError('Unauthorized', 401);
  }

  if (response.status === 403) {
    onForbidden?.();
    throw new ApiError('You do not have permission to perform this action.', 403);
  }

  let parsed: unknown = null;
  try {
    const text = await response.text();
    parsed = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON body — fall through with parsed = null.
  }

  const envelope = parsed as { statusCode?: number; statusMessage?: string; resultData?: T } | null;

  if (!response.ok) {
    throw new ApiError(
      envelope?.statusMessage || `Request failed (${response.status}).`,
      response.status,
      envelope?.statusCode,
    );
  }

  return (envelope?.resultData as T) ?? (null as T);
}
