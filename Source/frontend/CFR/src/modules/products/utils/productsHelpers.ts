import { APP_CATALOG } from '@shared/app/config/appCatalog';
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
  const text = String(value).trim();
  return text;
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

const compactKey = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, '');

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

const normalizeHubSection = (value: unknown): HubSectionValue | undefined => {
  const raw = String(value ?? '').trim().toLowerCase().replace(/[_\s]+/g, '-');
  if (raw === 'your-apps' || raw === 'active') return 'your';
  if (raw === 'coming-soon' || raw === 'upcoming' || raw === 'roadmap') return 'future';
  return HUB_SECTIONS.includes(raw as HubSectionValue) ? (raw as HubSectionValue) : undefined;
};

const deriveHubSection = (row: Record<string, unknown>, catalogSection?: HubSectionValue): HubSectionValue => {
  const explicit = normalizeHubSection(pickValue(row, 'hubSection', 'HubSection'));
  if (explicit) return explicit;

  const isAvailable = asBool(pickValue(row, 'isAvailable', 'IsAvailable'));
  if (isAvailable === true) return 'available';
  if (isAvailable === false) return 'future';

  return catalogSection ?? 'future';
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

const findCatalog = (productId: string, productName: string) => {
  const id = productId.trim().toLowerCase();
  const name = productName.trim().toLowerCase();
  const compactName = compactKey(productName);
  return APP_CATALOG.find((app) => {
    if (id && app.id.toLowerCase() === id) return true;
    if (name && (app.name.toLowerCase() === name || app.shortName.toLowerCase() === name)) return true;
    if (compactName && (compactKey(app.name) === compactName || compactKey(app.id) === compactName)) return true;
    return false;
  });
};

export const toCatalogApp = (row: HubProductApiItem): CatalogApp | null => {
  const source = asRecord(row) ?? {};
  if (asBool(pickValue(source, 'isDeleted', 'IsDeleted')) === true) return null;

  const productName = pickString(source, 'productName', 'ProductName', 'name', 'Name');
  const productId = pickString(source, 'productId', 'ProductId', 'id', 'Id');
  if (!productName && (!productId || productId === '0')) return null;

  const catalog = findCatalog(productId, productName);
  const hubSection = deriveHubSection(source, catalog?.hubSection);
  const features = readFeatures(source.features ?? source.Features ?? source.featureNames ?? source.FeatureNames);
  const seed = productId || productName || catalog?.id || 'product';
  const isYourApps = hubSection === 'your';
  const isAvailable = hubSection === 'available';

  return {
    id: (productId && productId !== '0' ? productId : catalog?.id) || seed,
    name: productName || catalog?.name || 'Untitled product',
    shortName: catalog?.shortName ?? productName,
    category: pickString(source, 'category', 'Category', 'subCategoryName', 'SubCategoryName') || catalog?.category || '',
    description: pickString(source, 'description', 'Description', 'prodDescription', 'ProdDescription') || catalog?.description || '',
    icon: catalog?.icon || pickString(source, 'icon', 'Icon') || '✦',
    gradient: catalog?.gradient ?? FALLBACK_GRADIENTS[hashIndex(seed, FALLBACK_GRADIENTS.length)],
    keywords: catalog?.keywords ?? [productName, pickString(source, 'category', 'Category', 'subCategoryName', 'SubCategoryName')].filter(Boolean),
    features: features.length > 0 ? features : (catalog?.features ?? []),
    stats: catalog?.stats ?? [],
    kind: isYourApps || isAvailable ? (catalog?.kind === 'external' ? 'external' : 'launchable') : (catalog?.kind ?? 'discover'),
    status: isYourApps ? 'active' : isAvailable ? 'available' : 'coming-soon',
    statusLabel: isYourApps ? 'Active' : isAvailable ? 'Access on request' : 'Coming soon',
    statusDetail: catalog?.statusDetail,
    details: catalog?.details,
    hubSection,
    deploymentModel: catalog?.deploymentModel ?? 'external-saas',
    ownership: catalog?.ownership ?? 'first-party',
    launcherEnabled: isYourApps,
    externalUrl: pickString(source, 'externalUrl', 'ExternalUrl', 'externalPageUrl', 'ExternalPageUrl') || catalog?.externalUrl,
    navigationTarget: catalog?.navigationTarget ?? 'same-tab',
    contactEmail: pickString(source, 'contactEmail', 'ContactEmail') || catalog?.contactEmail,
  };
};

export const normalizeHubProducts = (resultData: unknown): CatalogApp[] => {
  return unwrapResultList(resultData)
    .map((row) => (row && typeof row === 'object' ? toCatalogApp(row as HubProductApiItem) : null))
    .filter((app): app is CatalogApp => app != null);
};

export const mergeHubProducts = (resultData: unknown): CatalogApp[] => {
  const fromApi = normalizeHubProducts(resultData);
  const catalogList = Array.isArray(APP_CATALOG) ? APP_CATALOG.map((app) => ({ ...app })) : [];

  if (fromApi.length === 0) {
    return catalogList;
  }

  // Create a map of API products
  const apiMap = new Map<string, CatalogApp>();
  for (const apiApp of fromApi) {
    if (apiApp.id) {
      apiMap.set(apiApp.id.toLowerCase(), apiApp);
    }
  }

  const merged = catalogList.map((catalogApp) => {
    const apiApp = apiMap.get(catalogApp.id.toLowerCase());
    if (apiApp) {
      // API app overrides catalog app, updating status/hubSection based on DB
      return { ...catalogApp, ...apiApp };
    }
    return catalogApp;
  });

  // Include any API products that were not in the catalog
  const catalogIds = new Set(catalogList.map((a) => a.id.toLowerCase()));
  for (const apiApp of fromApi) {
    if (apiApp.id && !catalogIds.has(apiApp.id.toLowerCase())) {
      merged.push(apiApp);
    }
  }

  return merged;
};

export const productsFromApiResponse = (response: unknown): CatalogApp[] => {
  const envelope = asRecord(response);
  const payload = envelope
    ? (pickValue(envelope, 'resultData', 'ResultData') ?? response)
    : response;
  return mergeHubProducts(payload);
};

export const productsFromHubResponse = (response: unknown): CatalogApp[] => {
  const envelope = asRecord(response);
  const payload = envelope
    ? (pickValue(envelope, 'resultData', 'ResultData') ?? response)
    : response;
  const fromApi = normalizeHubProducts(payload);
  if (fromApi.length > 0) return fromApi;
  return APP_CATALOG.map((app) => ({ ...app }));
};

