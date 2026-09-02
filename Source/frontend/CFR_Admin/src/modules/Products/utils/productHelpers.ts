import type { ProductApiItem, ProductCustomerApiItem, ProductCustomerRow, ProductLicenseApiItem, ProductLicenseHistoryRow, ProductLocationState } from '../types/productTypes';
import type { AdminApplication, LicenseStatus, OrganizationStatus, ProductStatus } from '@/modules/types';
import { effectiveLicenseStatus } from '@/modules/utils/formatDate';

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

function readCustomerField(item: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
}

export const normalizeProductCustomerList = (resultData: unknown): ProductCustomerApiItem[] => {
  const raw = Array.isArray(resultData)
    ? resultData
    : resultData && typeof resultData === 'object' && Array.isArray((resultData as { $values?: unknown[] }).$values)
      ? (resultData as { $values: unknown[] }).$values
      : [];

  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => {
      const orgId = Number(item.orgId ?? item.OrgId ?? 0);
      return {
        orgId,
        orgName: readCustomerField(item, 'orgName', 'OrgName'),
        orgStatus: readCustomerField(item, 'orgStatus', 'OrgStatus'),
        contactEmail: readCustomerField(item, 'contactEmail', 'ContactEmail') || null,
        contactPerson: readCustomerField(item, 'contactPerson', 'ContactPerson') || null,
        contactPhone: readCustomerField(item, 'contactPhone', 'ContactPhone') || null,
        insertedDate: readCustomerField(item, 'insertedDate', 'InsertedDate'),
        updatedDate: readCustomerField(item, 'updatedDate', 'UpdatedDate') || null,
        userCount: Number(item.userCount ?? item.UserCount ?? 0),
        orgCode: readCustomerField(item, 'orgCode', 'OrgCode') || null,
        startDate: readCustomerField(item, 'startDate', 'StartDate') || null,
        expiryDate: readCustomerField(item, 'expiryDate', 'ExpiryDate') || null,
        licenseType: readCustomerField(item, 'licenseType', 'LicenseType') || null,
        licenseStatus: readCustomerField(item, 'licenseStatus', 'LicenseStatus') || null,
      };
    })
    .filter((item) => Number.isInteger(item.orgId) && item.orgId > 0);
}

function toOrganizationStatus(value: string | null | undefined): OrganizationStatus {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'trial') return 'trial';
  if (normalized === 'suspended') return 'suspended';
  return 'active';
}

export function toProductCustomerRow(item: ProductCustomerApiItem): ProductCustomerRow {
  const licenseType = String(item.licenseType ?? '').trim().toLowerCase();
  const statusSource = licenseType === 'trial' ? 'trial' : item.orgStatus || item.licenseStatus;
  return {
    id: String(item.orgId),
    name: item.orgName,
    primaryContact: item.contactPerson?.trim() || '—',
    code: item.orgCode?.trim() || `ORG-${item.orgId}`,
    contactEmail: item.contactEmail?.trim() || '—',
    userCount: item.userCount ?? 0,
    createdAt: item.startDate || item.insertedDate,
    expiryDate: item.expiryDate || '',
    status: toOrganizationStatus(statusSource),
  };
}

export function toLicenseHistoryRows(items: ProductLicenseApiItem[]): ProductLicenseHistoryRow[] {
  const licenses = items.filter((item) => Number(item.licenseId) > 0);
  const currentByOrg = new Map<number, number>();

  for (const item of licenses) {
    const existingId = currentByOrg.get(item.orgId);
    const existing = existingId == null ? undefined : licenses.find((row) => row.licenseId === existingId);
    const existingStart = existing?.activationDate ?? existing?.createdDate ?? '';
    const nextStart = item.activationDate ?? item.createdDate ?? '';
    if (existingId == null || nextStart > existingStart) {
      currentByOrg.set(item.orgId, item.licenseId);
    }
  }

  return licenses.map((item) => {
    const rawStatus = String(item.licenseStatus ?? item.assignStatus ?? '').toLowerCase();
    const storedStatus: LicenseStatus = rawStatus === 'suspended' ? 'suspended' : 'active';
    const startDate = item.activationDate ?? item.createdDate ?? '';
    const expiryDate = item.expiryDate ?? '';
    return {
      id: String(item.licenseId),
      licenseId: item.licenseId,
      orgId: String(item.orgId),
      customerCode: `ORG-${item.orgId}`,
      customer: item.orgName?.trim() || `Organization #${item.orgId}`,
      startDate,
      expiryDate,
      term: currentByOrg.get(item.orgId) === item.licenseId ? 'Current' : 'Past',
      status: effectiveLicenseStatus(storedStatus, expiryDate),
      rawStatus: item.licenseStatus,
      remarks: item.remarks,
    };
  });
}

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
  if (cleanPath.startsWith('/acutis/')) {
    return `${apiBase}${cleanPath}`;
  }
  return `${apiBase}/acutis${cleanPath}`;
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
