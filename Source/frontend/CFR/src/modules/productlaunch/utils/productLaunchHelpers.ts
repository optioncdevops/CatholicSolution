import type { CatalogApp } from '@shared/app/types/app';
import { productsFromHubResponse } from '@/modules/products/utils/productsHelpers';

export { productsFromHubResponse };

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const pickValue = (row: Record<string, unknown>, ...keys: string[]): unknown => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return undefined;
};

export const hubProductsFromResponse = (response: unknown): CatalogApp[] => {
  const envelope = asRecord(response);
  const payload = envelope
    ? (pickValue(envelope, 'resultData', 'ResultData') ?? response)
    : response;
  return productsFromHubResponse(payload);
};
