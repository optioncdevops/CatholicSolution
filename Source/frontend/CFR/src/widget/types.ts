export type ProductRow = {
  productId: number;
  productName: string;
  shortName?: string | null;
  subCategoryName?: string | null;
  externalPageUrl?: string | null;
  logoName?: string | null;
  isActive?: boolean;
  productStatus?: number | null;
  navigationTarget?: string | null;
  isDeleted?: boolean;
};

/** Normalized shape the render layer works with, independent of the API DTO. */
export type SwitcherApp = {
  productId: number;
  name: string;
  subCategory?: string;
  externalUrl: string;
  logoUrl?: string;
  navigationTarget?: string | null;
};

export type ApiEnvelope<T> = {
  statusCode?: number;
  statusMessage?: string;
  resultData?: T;
};

/** Direct CFR.DataSync mode's GetUserProducts payload shape (see UserProductsResult). */
export type UserProductsPayload = {
  products?: ProductRow[];
  platformLaunchCode?: string | null;
};

export type DirectDataSyncResult = {
  apps: SwitcherApp[];
  /** One-time code for CFR.Portal's PlatformLaunch/ExchangeToken, minted in the same call. */
  platformLaunchCode: string | null;
};
