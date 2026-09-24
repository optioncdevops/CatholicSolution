import { CFR_GATEWAY_ORIGIN, LOGO_PUBLIC_PATH, SELF_SCRIPT_SRC, TILE_COLORS } from '../constants';
import type { ProductRow, SwitcherApp } from '../types';

export function hashIndex(value: string, size: number): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % size;
}

export function tileColorFor(app: SwitcherApp): string {
  return TILE_COLORS[hashIndex(String(app.productId || app.name || 'app'), TILE_COLORS.length)];
}

export function selfOrigin(): string | null {
  if (!SELF_SCRIPT_SRC) return null;
  try {
    return new URL(SELF_SCRIPT_SRC).origin;
  } catch {
    return null;
  }
}

export function buildLogoUrl(apiBase: string, logoName: string): string {
  const fileName = logoName.replace(/\\/g, '/').split('/').filter(Boolean).pop() ?? '';
  return `${apiBase}${LOGO_PUBLIC_PATH}${fileName}`;
}

// Applied only to rows from CFR's own default (Acutis GetProducts) endpoint, which returns
// every product unfiltered - IsDeleted/IsActive/ProductStatus must be checked client-side.
// Direct CFR.DataSync mode's ProductSync/GetUserProducts already returns only that user's
// active, assigned products, so only the launch-URL presence is checked there.
export function isLaunchableDefault(row: ProductRow): boolean {
  return (
    Boolean(row) &&
    row.isDeleted !== true &&
    row.isActive === true &&
    row.productStatus === 1 &&
    Boolean(row.externalPageUrl && row.externalPageUrl.trim())
  );
}

export function isLaunchableDirectDataSync(row: ProductRow): boolean {
  return Boolean(row) && Boolean(row.externalPageUrl && row.externalPageUrl.trim());
}

// Logo files are always served from CFR/Acutis's own attachment storage, regardless of which
// endpoint (default GetProducts or CFR.DataSync's GetUserProducts) the product row came from -
// so this always resolves against the CFR gateway origin, never the CFR.DataSync base URL.
export function toSwitcherApp(row: ProductRow): SwitcherApp {
  return {
    productId: row.productId,
    name: row.shortName || row.productName,
    subCategory: (row.subCategoryName ?? '').trim() || undefined,
    externalUrl: (row.externalPageUrl ?? '').trim(),
    logoUrl: row.logoName && row.logoName.trim() ? buildLogoUrl(CFR_GATEWAY_ORIGIN, row.logoName.trim()) : undefined,
    navigationTarget: row.navigationTarget,
  };
}

export function readHostSessionValue(key: string): string {
  try {
    return sessionStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}
