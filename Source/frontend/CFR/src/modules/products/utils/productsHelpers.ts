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

const FALLBACK_ICONS = ['📦', '🧩', '🗂️', '🛠️', '✨', '🔔'];

const HUB_SECTIONS: HubSectionValue[] = ['your', 'available', 'future'];

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const pickString = (row: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const value = row[key];
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
};

const compactKey = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, '');

const normalizeHubSection = (value: unknown): HubSectionValue => {
  const raw = String(value ?? '').trim().toLowerCase();
  return HUB_SECTIONS.includes(raw as HubSectionValue) ? (raw as HubSectionValue) : 'future';
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
  const nested = row.data ?? row.Data ?? row.items ?? row.Items ?? row.resultData ?? row.ResultData;
  return Array.isArray(nested) ? nested : [];
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

export const normalizeHubProducts = (resultData: unknown): CatalogApp[] => {
  return unwrapResultList(resultData)
    .filter((row) => row && typeof row === 'object')
    .map((row) => toCatalogApp(row as HubProductApiItem));
};

export const mergeHubProducts = (resultData: unknown): CatalogApp[] => {
  const fromApi = normalizeHubProducts(resultData);
  if (fromApi.length > 0) return fromApi;
  return APP_CATALOG.map((app) => ({ ...app }));
};

export const toCatalogApp = (row: HubProductApiItem): CatalogApp => {
  const source = asRecord(row) ?? {};
  const productName = pickString(source, 'productName', 'ProductName', 'name', 'Name');
  const productId = pickString(source, 'productId', 'ProductId', 'id', 'Id');
  const catalog = findCatalog(productId, productName);
  const hubSection = normalizeHubSection(pickString(source, 'hubSection', 'HubSection') || catalog?.hubSection);
  const features = readFeatures(source.features ?? source.Features);
  const seed = productId || productName || catalog?.id || 'product';
  const isYourApps = hubSection === 'your';
  const isAvailable = hubSection === 'available';

  return {
    id: catalog?.id || productId || seed,
    name: productName || catalog?.name || 'Untitled product',
    shortName: catalog?.shortName ?? productName,
    category: pickString(source, 'category', 'Category', 'SubCategoryName') || catalog?.category || '',
    description: pickString(source, 'description', 'Description', 'ProdDescription') || catalog?.description || '',
    icon: catalog?.icon ?? FALLBACK_ICONS[hashIndex(seed, FALLBACK_ICONS.length)],
    gradient: catalog?.gradient ?? FALLBACK_GRADIENTS[hashIndex(seed, FALLBACK_GRADIENTS.length)],
    keywords: catalog?.keywords ?? [productName, pickString(source, 'category', 'Category')].filter(Boolean),
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
    externalUrl: pickString(source, 'externalUrl', 'ExternalUrl', 'ExternalPageUrl') || catalog?.externalUrl,
    navigationTarget: catalog?.navigationTarget ?? 'same-tab',
  };
};
