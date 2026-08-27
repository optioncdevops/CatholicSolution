/**
 * Real, minimal client for CFR.Acutis's authentication API — the only backend integration this
 * project talks to today (login only, matching what AuthProvider actually needs). Mirrors
 * `frontend/SaaS_Apps/acutis`'s own adapter contract/shapes exactly (same DTOs, same
 * MSResultArgs envelope) but is intentionally standalone here rather than a shared package,
 * since CFR_Admin and the Acutis SaaS app remain independent projects (see frontend/CLAUDE.md's
 * no-shared-workspace rule). Never logs credentials, tokens, or response bodies.
 */

const BASE_URL = import.meta.env.VITE_ACUTIS_API_BASE_URL as string | undefined;

export class AcutisAuthApiError extends Error {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly domainStatusCode?: number,
  ) {
    super(message);
    this.name = 'AcutisAuthApiError';
  }
}

export interface AcutisLoginUser {
  userId: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  /** Coarse-grained authorization signal from the real database — gates CFR_Admin's nav menu. */
  isSuperUser: boolean;
  token: string;
}

interface MSResultArgsEnvelope<T> {
  statusCode?: number;
  statusMessage?: string;
  resultData?: T;
}

export async function acutisLogin(email: string, password: string): Promise<AcutisLoginUser> {
  if (!BASE_URL) {
    throw new AcutisAuthApiError(
      'The Acutis authentication service is not configured (VITE_ACUTIS_API_BASE_URL is missing).',
      0,
    );
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/Auth/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: email, password }),
    });
  } catch {
    // Network-level failure (server down, CORS, etc.) — no request/response detail to leak.
    throw new AcutisAuthApiError('Unable to reach the authentication service. Please try again.', 0);
  }

  let parsed: unknown = null;
  try {
    const text = await response.text();
    parsed = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON body — fall through with parsed = null.
  }

  const envelope = parsed as MSResultArgsEnvelope<{ user: AcutisLoginUser }> | null;

  if (!response.ok) {
    throw new AcutisAuthApiError(
      envelope?.statusMessage || 'Invalid email or password. Check your credentials and try again.',
      response.status,
      envelope?.statusCode,
    );
  }

  const user = envelope?.resultData?.user;
  if (!user?.token) {
    throw new AcutisAuthApiError('Sign-in succeeded but no session token was returned.', response.status);
  }

  return user;
}
