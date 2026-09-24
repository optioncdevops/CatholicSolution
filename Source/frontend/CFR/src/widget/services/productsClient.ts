import { PRODUCTS_ENDPOINT_PATH } from '../constants';
import type { ApiEnvelope, ProductRow, SwitcherApp } from '../types';
import { isLaunchableDefault, toSwitcherApp } from '../utils/switcherHelpers';

/** Default (CFR-hosted) mode: an anonymous, CORS-open catalog of every first-party product. */
export async function fetchLaunchableApps(apiBase: string): Promise<SwitcherApp[]> {
  const response = await fetch(`${apiBase}${PRODUCTS_ENDPOINT_PATH}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`GetProducts failed with status ${response.status}`);
  }
  const envelope = (await response.json()) as ApiEnvelope<ProductRow[]>;
  const rows = Array.isArray(envelope.resultData) ? envelope.resultData : [];
  return rows.filter(isLaunchableDefault).map(toSwitcherApp);
}
