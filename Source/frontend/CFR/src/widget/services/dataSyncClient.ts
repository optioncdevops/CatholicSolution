import { DATASYNC_LAUNCH_PATH, DATASYNC_LOGIN_PATH, DATASYNC_PRODUCTS_PATH, DATASYNC_TOKEN_STORAGE_KEY } from '../constants';
import type { ApiEnvelope, DirectDataSyncResult, UserProductsPayload } from '../types';
import { isLaunchableDirectDataSync, toSwitcherApp } from '../utils/switcherHelpers';

type DataSyncLoginResult = { accessToken?: string };

function getCachedToken(): string {
  try {
    return sessionStorage.getItem(DATASYNC_TOKEN_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function cacheToken(token: string): void {
  try {
    sessionStorage.setItem(DATASYNC_TOKEN_STORAGE_KEY, token);
  } catch {
    // Storage unavailable (private mode, quota) - falls back to logging in again next call.
  }
}

function clearCachedToken(): void {
  try {
    sessionStorage.removeItem(DATASYNC_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore - nothing to clear if storage is unavailable.
  }
}

async function loginToDataSync(baseUrl: string, clientId: string, clientSecret: string): Promise<string> {
  const response = await fetch(`${baseUrl}${DATASYNC_LOGIN_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  });
  if (!response.ok) return '';
  const envelope = (await response.json()) as ApiEnvelope<DataSyncLoginResult>;
  return envelope.resultData?.accessToken ?? '';
}

/**
 * Runs an authenticated DataSync call, reusing this tab's cached bearer token (set by a previous
 * widget load on an earlier page in the same session) so most loads skip the Auth/Login round
 * trip entirely. Falls back to a fresh login when there is no cached token yet, and retries once
 * with a fresh token if the cached one has expired (401) - the caller only ever sees the final
 * parsed result, or null if every avenue failed.
 */
async function withDataSyncToken<T>(
  baseUrl: string,
  clientId: string,
  clientSecret: string,
  call: (token: string) => Promise<Response>,
): Promise<T | null> {
  let token = getCachedToken();
  if (!token) {
    token = await loginToDataSync(baseUrl, clientId, clientSecret);
    if (!token) return null;
    cacheToken(token);
  }

  let response = await call(token);
  if (response.status === 401) {
    clearCachedToken();
    token = await loginToDataSync(baseUrl, clientId, clientSecret);
    if (!token) return null;
    cacheToken(token);
    response = await call(token);
  }

  if (!response.ok) return null;
  return (await response.json()) as T;
}

/**
 * Direct CFR.DataSync mode's full fetch: resolve this CFR member's products (and App Hub launch
 * code) for the App Switcher panel. Resolves to null whenever this visitor shouldn't see the
 * widget at all - no linked CFR identity, or any step fails - so the caller renders nothing.
 */
export async function fetchDirectDataSyncApps(
  baseUrl: string,
  clientId: string,
  clientSecret: string,
  cfrEmail: string,
): Promise<DirectDataSyncResult | null> {
  try {
    const envelope = await withDataSyncToken<ApiEnvelope<UserProductsPayload>>(
      baseUrl,
      clientId,
      clientSecret,
      (token) =>
        fetch(`${baseUrl}${DATASYNC_PRODUCTS_PATH}?email=${encodeURIComponent(cfrEmail)}`, {
          method: 'GET',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        }),
    );
    if (!envelope) return null;

    const rows = Array.isArray(envelope.resultData?.products) ? envelope.resultData.products : [];
    return {
      apps: rows.filter(isLaunchableDirectDataSync).map(toSwitcherApp),
      platformLaunchCode: envelope.resultData?.platformLaunchCode ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Direct CFR.DataSync mode only: mints a real one-time launch code for this product (the same
 * [dbo].[Portal_CFRLaunch] mechanism CFR's own App Hub "Launch" button uses), so the tile click
 * lands the visitor already signed in on the target product, instead of at its own login page.
 * Null means the launch couldn't be created (expired session, not assigned, etc.) - the caller
 * falls back to the plain BaseUrl rather than doing nothing.
 */
export async function launchViaDataSync(
  baseUrl: string,
  clientId: string,
  clientSecret: string,
  cfrEmail: string,
  productId: number,
): Promise<string | null> {
  try {
    const envelope = await withDataSyncToken<ApiEnvelope<{ launchUrl?: string }>>(
      baseUrl,
      clientId,
      clientSecret,
      (token) =>
        fetch(`${baseUrl}${DATASYNC_LAUNCH_PATH}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ email: cfrEmail, productId }),
        }),
    );
    return envelope?.resultData?.launchUrl ?? null;
  } catch {
    return null;
  }
}
