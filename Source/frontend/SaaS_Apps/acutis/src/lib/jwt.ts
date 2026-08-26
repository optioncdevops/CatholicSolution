/**
 * Minimal, dependency-free JWT payload decoder — reads only the standard `exp` claim to check
 * expiry client-side. Never trust this for anything security-relevant (the backend independently
 * validates signature/issuer/audience/lifetime on every request); this exists purely so the
 * frontend can proactively redirect to Session Expired instead of waiting for a 401.
 */
export function getJwtExpiryMs(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadB64.padEnd(payloadB64.length + ((4 - (payloadB64.length % 4)) % 4), '=');
    const json = atob(padded);
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  const expiryMs = getJwtExpiryMs(token);
  if (expiryMs === null) return true;
  return Date.now() >= expiryMs;
}
