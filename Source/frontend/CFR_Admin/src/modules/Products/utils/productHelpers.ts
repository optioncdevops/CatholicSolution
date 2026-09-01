import type { ProductApiItem, ProductLocationState } from '../types/productTypes';
import type { AdminApplication, ProductStatus } from '@/modules/types';

export function toProductSlug(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const PRODUCTS_PATHS = {
  list: '/admin/products',
  details: (slugOrId?: string | number) =>
    slugOrId ? `/admin/products/${toProductSlug(String(slugOrId)) || slugOrId}` : '/admin/products',
  edit: (slugOrId?: string | number) =>
    slugOrId ? `/admin/products/${toProductSlug(String(slugOrId)) || slugOrId}/edit` : '/admin/products/edit',
  addLicense: (slugOrId?: string | number) =>
    slugOrId ? `/admin/products/${toProductSlug(String(slugOrId)) || slugOrId}/add-license` : '/admin/products/add-license',
} as const;

export const DEFAULT_PRODUCT_ICON = '📦';
export const DEFAULT_PRODUCT_GRADIENT = 'linear-gradient(135deg,#1E3A8A,#3B82F6)';

export function parseProductIdFromState(state: unknown): number | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const raw = (state as ProductLocationState).productId;
  const productId = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  return productId;
}

export function deriveProductStatus(item: ProductApiItem): ProductStatus {
  if (!item.isAvailable) return 'coming-soon';
  return item.isActive ? 'active' : 'inactive';
}

export const normalizeProductList = (resultData: unknown): ProductApiItem[] => {
  if (!Array.isArray(resultData)) {
    return [];
  }
  return resultData as ProductApiItem[];
};

export function resolveProductLogoUrl(logoUrl: string | null | undefined): string | null {
  if (!logoUrl || typeof logoUrl !== 'string' || !logoUrl.trim()) {
    return null;
  }
  const trimmed = logoUrl.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const apiBase = String(import.meta.env.VITE_APP_REST_API_BASE_URL ?? '').replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const finalPath = cleanPath.startsWith('/acutis') ? cleanPath : `/acutis${cleanPath}`;
  return `${apiBase}${finalPath}`;
}

export function toAdminApplication(item: ProductApiItem): AdminApplication {
  const logoUrl = resolveProductLogoUrl(item.logoUrl) || item.logoUrl || '';
  return {
    id: String(item.productId),
    name: item.productName,
    shortName: item.productName,
    category: item.subCategoryName || 'General',
    icon: logoUrl || DEFAULT_PRODUCT_ICON,
    gradient: DEFAULT_PRODUCT_GRADIENT,
    description: item.prodDescription || '',
    features: item.features ?? [],
    productionUrl: item.externalPageUrl || '',
    ownership: 'first-party',
    deploymentModel: 'external-saas',
    licenseType: item.defaultAccessDays === 0 ? 'free' : 'licensed',
    navigationTarget: 'same-tab',
    status: deriveProductStatus(item),
    registryRef: `reg_app_${String(item.productId).padStart(4, '0')}`,
    sourceLocation: `SaaS_Apps/${item.productName.toLowerCase().replace(/\s+/g, '-')}`,
    updatedAt: item.updatedDate || item.createdDate,
  };
}
