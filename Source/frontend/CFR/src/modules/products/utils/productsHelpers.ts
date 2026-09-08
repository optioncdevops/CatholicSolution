import type { CatalogApp } from '@shared/app/types/app';
import type { HubProductApiItem, HubSectionValue } from '../types/productsTypes';

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg,#1E3A8A,#3B82F6)',
  'linear-gradient(135deg,#0F766E,#34D399)',
  'linear-gradient(135deg,#166534,#22C55E)',
  'linear-gradient(135deg,#B91C1C,#EF4444)',
  'linear-gradient(135deg,#7C3AED,#A78BFA)',
  'linear-gradient(135deg,#C2410C,#FB923C)',
];

const HUB_SECTIONS: HubSectionValue[] = ['your', 'available', 'future'];

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

const pickString = (row: Record<string, unknown>, ...keys: string[]): string => {
  const value = pickValue(row, ...keys);
  if (value === undefined || value === null) return '';
  return String(value).trim();
};

const asBool = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const text = String(value).trim().toLowerCase();
  if (text === '1' || text === 'true' || text === 'yes') return true;
  if (text === '0' || text === 'false' || text === 'no') return false;
  return undefined;
};

const hashIndex = (value: string, size: number) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % size;
};

const readFeatures = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((feature) => String(feature).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[|,]/).map((feature) => feature.trim()).filter(Boolean);
  }
  return [];
};

const normalizeHubSection = (value: unknown): HubSectionValue => {
  const raw = String(value ?? '').trim().toLowerCase().replace(/[_\s]+/g, '-');
  if (raw === 'your-apps' || raw === 'active' || raw === 'your') return 'your';
  if (raw === 'available') return 'available';
  return HUB_SECTIONS.includes(raw as HubSectionValue) ? (raw as HubSectionValue) : 'future';
};

export const unwrapResultList = (resultData: unknown): unknown[] => {
  if (Array.isArray(resultData)) return resultData;
  if (typeof resultData === 'string') {
    try {
      return unwrapResultList(JSON.parse(resultData));
    } catch {
      return [];
    }
  }
  const row = asRecord(resultData);
  if (!row) return [];
  const nested = pickValue(row, 'resultData', 'ResultData', 'data', 'Data', 'items', 'Items', '$values');
  if (nested !== undefined) return unwrapResultList(nested);
  return [];
};

export const toCatalogApp = (row: HubProductApiItem): CatalogApp | null => {
  const source = asRecord(row) ?? {};
  if (asBool(pickValue(source, 'isDeleted', 'IsDeleted')) === true) return null;

  const productName = pickString(source, 'productName', 'ProductName', 'name', 'Name');
  const productId = pickString(source, 'productId', 'ProductId', 'id', 'Id');
  if (!productName && (!productId || productId === '0')) return null;

  const hubSection = normalizeHubSection(pickValue(source, 'hubSection', 'HubSection'));
  const features = readFeatures(source.features ?? source.Features ?? source.featureNames ?? source.FeatureNames);
  const seed = productId || productName || 'product';
  const isYourApps = hubSection === 'your';
  const isAvailable = hubSection === 'available';
  const numericProductId = Number(productId);
  const resolvedProductId = Number.isFinite(numericProductId) && numericProductId > 0 ? numericProductId : undefined;
  const baseUrl = pickString(source, 'baseUrl', 'BaseUrl', 'externalUrl', 'ExternalUrl', 'externalPageUrl', 'ExternalPageUrl');
  const canRequest = asBool(pickValue(source, 'canRequest', 'CanRequest')) === true;

  console.log('Raw product source from API:', source);

  return {
    id: (productId && productId !== '0' ? productId : seed),
    productId: resolvedProductId,
    name: productName || 'Untitled product',
    shortName: productName,
    category: pickString(source, 'category', 'Category', 'subCategoryName', 'SubCategoryName'),
    description: pickString(source, 'description', 'Description', 'prodDescription', 'ProdDescription'),
    icon: pickString(source, 'icon', 'Icon', 'logoUrl', 'LogoUrl') || '✦',
    gradient: FALLBACK_GRADIENTS[hashIndex(seed, FALLBACK_GRADIENTS.length)],
    keywords: [productName, pickString(source, 'category', 'Category', 'subCategoryName', 'SubCategoryName')].filter(Boolean),
    features,
    stats: [],
    kind: isYourApps || isAvailable ? 'launchable' : 'discover',
    status: isYourApps ? 'active' : isAvailable ? 'available' : 'coming-soon',
    statusLabel: isYourApps ? 'Active' : isAvailable ? 'Access on request' : 'Coming soon',
    hubSection,
    deploymentModel: 'external-saas',
    ownership: 'first-party',
    launcherEnabled: isYourApps,
    externalUrl: baseUrl || undefined,
    navigationTarget: 'same-tab',
    canRequest,
    isOrgApproved: asBool(pickValue(source, 'isOrgApproved', 'IsOrgApproved')) === true,
    contactUserId: (pickValue(source, 'contactUserId', 'ContactUserId') as string | number | undefined) ?? undefined,
    contactEmail: pickString(source, 'contactEmail', 'ContactEmail') || undefined,
  };
};

export const normalizeHubProducts = (resultData: unknown): CatalogApp[] => {
  return unwrapResultList(resultData)
    .map((row) => (row && typeof row === 'object' ? toCatalogApp(row as HubProductApiItem) : null))
    .filter((app): app is CatalogApp => app != null);
};

export const productsFromApiResponse = (response: unknown): CatalogApp[] => {
  const envelope = asRecord(response);
  const payload = envelope
    ? (pickValue(envelope, 'resultData', 'ResultData') ?? response)
    : response;
  return normalizeHubProducts(payload);
};

export const productsFromHubResponse = (response: unknown): CatalogApp[] => {
  return productsFromApiResponse(response);
};
