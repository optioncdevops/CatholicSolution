import type { ProductApiItem, ProductContactUser, ProductCustomerApiItem, ProductCustomerRow, ProductLicenseApiItem, ProductLicenseHistoryRow, ProductLocationState, ProductDetailsTab, LiveProductLicense } from '../types/productTypes';
import type { AdminApplication, LicenseStatus, OrganizationStatus, ProductStatus } from '@/modules/types';
import { accessStatusOf, daysUntil, effectiveLicenseStatus, formatDateTime } from '@/modules/utils/formatDate';
export * from './productFilters';
export type { LiveProductLicense } from '../types/productTypes';

export const PRODUCTS_PATHS = {
  list: '/admin/products',
  details: '/admin/product-details',
  edit: '/admin/edit-products',
  addLicense: '/admin/add-product-license',
} as const;

export const DEFAULT_PRODUCT_ICON = '📦';
export const DEFAULT_PRODUCT_GRADIENT = 'linear-gradient(135deg,#1E3A8A,#3B82F6)';
export const DEFAULT_LICENSE_STATUS: LicenseStatus = 'active';

/**
 * Formats a customer code or org ID in standard "CUST-XXXX" format.
 */
export function formatCustomerCodeNumeric(codeOrId: string | number | null | undefined): string {
  if (codeOrId == null) return '—';
  const str = String(codeOrId).trim();
  if (!str) return '—';
  if (/^CUST-/i.test(str)) {
    return str.toUpperCase();
  }
  const clean = str.replace(/^(?:ORG[-_ ]*)+/i, '').trim();
  return clean ? `CUST-${clean}` : str;
}

/**
 * Formats a customer code or org ID as a pure integer string without any "CUST-" or "ORG-" prefix.
 */
export function formatCustomerCodeAsInteger(codeOrId: string | number | null | undefined): string {
  if (codeOrId == null) return '—';
  const str = String(codeOrId).trim();
  if (!str) return '—';
  const clean = str.replace(/^(?:CUST|ORG)[-_ ]*/i, '').replace(/[^\d]/g, '').trim();
  return clean || str;
}

export function toProductCustomerCount(value: unknown): number {
  const raw = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.trunc(raw);
}

export function formatProductCustomerCount(count: number): string {
  const n = toProductCustomerCount(count);
  return n === 1 ? '1 customer' : `${n} customers`;
}

export function toProductContactUserId(value: unknown): number | null {
  const raw = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isInteger(raw) || raw <= 0) return null;
  return raw;
}

export function toProductContactPersonName(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeProductContactUsers(resultData: unknown): ProductContactUser[] {
  if (!Array.isArray(resultData)) return [];
  return resultData
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const item = row as ProductContactUser & { FullName?: string; EMail?: string; UserId?: number; IsActive?: number };
      const userId = toProductContactUserId(item.userId ?? item.UserId);
      if (!userId) return null;
      const fullName = toProductContactPersonName(item.fullName ?? item.FullName);
      const eMail = typeof item.eMail === 'string' ? item.eMail : typeof item.EMail === 'string' ? item.EMail : '';
      const isActive = Number(item.isActive ?? item.IsActive) === 1 ? 1 : 0;
      return { userId, fullName: fullName || eMail || `User ${userId}`, eMail, isActive };
    })
    .filter((row): row is ProductContactUser => row != null);
}

export const PRODUCT_DETAILS_TABS = ['details', 'customers', 'invoice-details', 'invoice-history'] as const;

export function parseProductTabFromState(state: unknown): ProductDetailsTab | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const tab = (state as ProductLocationState).tab;
  if (typeof tab !== 'string') {
    return null;
  }

  return (PRODUCT_DETAILS_TABS as readonly string[]).includes(tab) ? (tab as ProductDetailsTab) : null;
}

export function parseProductIdFromState(state: unknown): number | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const raw =
    (state as ProductLocationState).productId ??
    (state as { id?: unknown }).id;
  const productId = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  return productId;
}

export function deriveProductStatus(item: ProductApiItem): ProductStatus {
  if (!item.isActive || item.productStatus == null) return 'inactive';
  if (item.productStatus === 2) return 'coming-soon';
  return 'active';
}

export const normalizeProductList = (resultData: unknown): ProductApiItem[] => {
  if (!Array.isArray(resultData)) {
    return [];
  }
  return resultData.map((item) => normalizeProductApiItem(item)).filter((item): item is ProductApiItem => item != null);
};

export function normalizeProductApiItem(resultData: unknown): ProductApiItem | null {
  if (!resultData || typeof resultData !== 'object') {
    return null;
  }
  const item = resultData as Record<string, unknown>;
  const rawFeatures = item.features ?? item.Features;
  const features = Array.isArray(rawFeatures)
    ? rawFeatures.map(String).filter(Boolean)
    : [];

  return {
    productId: Number(item.productId ?? item.ProductId ?? 0),
    productName: String(item.productName ?? item.ProductName ?? ''),
    subCategoryName: (item.subCategoryName ?? item.SubCategoryName ?? null) as string | null,
    prodDescription: (item.prodDescription ?? item.ProdDescription ?? null) as string | null,
    externalPageUrl: (item.externalPageUrl ?? item.ExternalPageUrl ?? null) as string | null,
    defaultAccessDays: Number(item.defaultAccessDays ?? item.DefaultAccessDays ?? 0),
    logoName: (item.logoName ?? item.LogoName ?? null) as string | null,
    isActive: Boolean(item.isActive ?? item.IsActive ?? false),
    productStatus: item.productStatus != null
      ? Number(item.productStatus)
      : item.ProductStatus != null
        ? Number(item.ProductStatus)
        : null,
    licenseType: (item.licenseType ?? item.LicenseType ?? null) as string | null,
    navigationTarget: (item.navigationTarget ?? item.NavigationTarget ?? null) as string | null,
    customerCount: toProductCustomerCount((item.customerCount ?? item.CustomerCount) as number),
    contactUserId: toProductContactUserId(item.contactUserId ?? item.ContactUserId),
    contactPerson: toProductContactPersonName((item.contactPerson ?? item.ContactPerson) as string) || null,
    features,
    createdDate: String(item.createdDate ?? item.CreatedDate ?? ''),
    insertedBy: item.insertedBy != null ? Number(item.insertedBy) : item.InsertedBy != null ? Number(item.InsertedBy) : null,
    updatedDate: item.updatedDate ? String(item.updatedDate) : item.UpdatedDate ? String(item.UpdatedDate) : null,
    updatedBy: item.updatedBy != null ? Number(item.updatedBy) : item.UpdatedBy != null ? Number(item.UpdatedBy) : null,
    isDeleted: Boolean(item.isDeleted ?? item.IsDeleted ?? false),
  };
}

export const normalizeProductCustomerList = (resultData: unknown): ProductCustomerApiItem[] => {
  if (!Array.isArray(resultData)) return [];
  return (resultData as ProductCustomerApiItem[]).filter(
    (item): item is ProductCustomerApiItem => Boolean(item && typeof item === 'object' && Number(item.orgId) > 0),
  );
};

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
    code: formatCustomerCodeAsInteger(item.orgCode || item.orgId),
    contactEmail: item.contactEmail?.trim() || '—',
    userCount: Number(item.userCount ?? (item as unknown as { UserCount?: unknown }).UserCount ?? 0),
    createdAt: item.startDate || item.insertedDate,
    expiryDate: item.expiryDate || '',
    status: toOrganizationStatus(statusSource),
  };
}

function licenseTimestamp(item: ProductLicenseApiItem): string {
  return item.createdDate || item.activationDate || '';
}

function isNewerLicense(candidate: ProductLicenseApiItem, current: ProductLicenseApiItem): boolean {
  const candidateStamp = licenseTimestamp(candidate);
  const currentStamp = licenseTimestamp(current);
  if (candidateStamp !== currentStamp) return candidateStamp > currentStamp;
  return candidate.licenseId > current.licenseId;
}

export function isLicenseSuspended(item: ProductLicenseApiItem): boolean {
  const licenseStatus = String(item.licenseStatus ?? '').trim().toLowerCase();
  const assignStatus = String(item.assignStatus ?? '').trim().toLowerCase();
  return licenseStatus === 'suspended' || licenseStatus === 'cancelled' || assignStatus === 'suspended' || assignStatus === 'revoked';
}

export function isLicenseUpcoming(item: ProductLicenseApiItem): boolean {
  const start = item.activationDate;
  if (!start) return false;
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return startDate.getTime() > today.getTime();
}

export function isActiveOrUpcomingLicense(item: ProductLicenseApiItem): boolean {
  if (Number(item.licenseId) <= 0 || isLicenseSuspended(item)) return false;
  if (isLicenseUpcoming(item)) return true;
  const effective = effectiveLicenseStatus('active', item.expiryDate || '');
  return effective === 'active' || effective === 'expiring-soon';
}

export function toLicenseDetailsRows(items: ProductLicenseApiItem[]): ProductLicenseApiItem[] {
  const licenses = items.filter((item) => Number(item.licenseId) > 0);
  const latestByOrg = new Map<number, ProductLicenseApiItem>();
  for (const item of licenses) {
    const existing = latestByOrg.get(item.orgId);
    if (!existing || isNewerLicense(item, existing)) {
      latestByOrg.set(item.orgId, item);
    }
  }
  return [...latestByOrg.values()]
    .filter(isActiveOrUpcomingLicense)
    .sort((left, right) => {
      if (isNewerLicense(left, right)) return -1;
      if (isNewerLicense(right, left)) return 1;
      return 0;
    });
}

export function toLiveProductLicenseRows(items: ProductLicenseApiItem[]): LiveProductLicense[] {
  const licenses = toLicenseDetailsRows(items);
  const usedInvoiceNumbers = new Set<string>();
  return licenses.map((lic, index) => {
    const days = lic.expiryDate ? daysUntil(lic.expiryDate) : null;
    const isOverdue = days !== null && days < 0;
    const isExpiringSoon = days !== null && days >= 0 && days <= 30;
    const status = isOverdue
      ? 'overdue'
      : isExpiringSoon
        ? 'expiring-soon'
        : lic.licenseStatus === 'suspended'
          ? 'suspended'
          : 'paid';
    const paidOn = isOverdue
      ? null
      : lic.activationDate
        ? formatDateTime(lic.activationDate)
        : lic.createdDate
          ? formatDateTime(lic.createdDate)
          : null;

    const startDate = lic.activationDate || '';
    const invoiceNumber = formatInvoiceNumber(
      startDate || lic.createdDate,
      lic.licenseId,
      usedInvoiceNumbers,
      index,
    );

    return {
      id: String(lic.licenseId),
      orgId: lic.orgId,
      customerCode: formatCustomerCodeAsInteger(lic.orgId),
      customer: lic.orgName || `Organization #${lic.orgId}`,
      invoiceNumber,
      licenseNumber: `LIC-${String(lic.licenseId).padStart(5, '0')}`,
      licenseKey: `LIC-${lic.orgId}-${lic.productId}-${String(lic.licenseId).padStart(4, '0')}`,
      licenseType: lic.licenseType ? (lic.licenseType.charAt(0).toUpperCase() + lic.licenseType.slice(1)) : 'Subscription',
      startDate,
      expiryDate: lic.expiryDate || '',
      days,
      paidOn,
      status,
      remarks: lic.remarks,
    };
  });
}

export function customerHasActiveLicense(items: ProductLicenseApiItem[], orgId: number): boolean {
  return toLicenseDetailsRows(items).some((item) => item.orgId === orgId);
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

  const usedInvoiceNumbers = new Set<string>();
  return licenses.map((item, index) => {
    const startDate = item.activationDate ?? item.createdDate ?? '';
    const expiryDate = item.expiryDate ?? '';
    const invoiceNumber = formatInvoiceNumber(
      startDate,
      item.licenseId,
      usedInvoiceNumbers,
      index,
    );
    const days = expiryDate ? daysUntil(expiryDate) : null;
    const isOverdue = days !== null && days < 0;
    const paymentStatus: 'paid' | 'overdue' | 'suspended' = isOverdue
      ? 'overdue'
      : item.licenseStatus === 'suspended'
        ? 'suspended'
        : 'paid';
    const paidOn = isOverdue
      ? null
      : item.activationDate
        ? formatDateTime(item.activationDate)
        : item.createdDate
          ? formatDateTime(item.createdDate)
          : null;

    return {
      id: String(item.licenseId),
      licenseId: item.licenseId,
      invoiceNumber,
      orgId: String(item.orgId),
      customerCode: formatCustomerCodeAsInteger(item.orgId),
      customer: item.orgName?.trim() || `Organization #${item.orgId}`,
      startDate,
      expiryDate,
      days,
      paidOn,
      paymentStatus,
      term: currentByOrg.get(item.orgId) === item.licenseId ? 'Current' : 'Past',
      status: accessStatusOf(expiryDate),
      rawStatus: item.licenseStatus,
      remarks: item.remarks,
    };
  });
}

const PRODUCT_LOGO_PUBLIC_DIR = '/Acutis/Attachment/Products';

export function pickProductLogoUrl(item: unknown): string | null {
  if (!item || typeof item !== 'object') {
    return null;
  }
  const record = item as Record<string, unknown>;
  const raw = record.logoName ?? record.LogoName;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

export function toStoredProductLogoPath(logoName: string | null | undefined): string | null {
  if (!logoName || typeof logoName !== 'string' || !logoName.trim()) return null;
  const trimmed = logoName.trim().replace(/\\/g, '/');
  return trimmed.split('/').filter(Boolean).pop() ?? null;
}

export function resolveProductLogoUrl(
  logoName: string | null | undefined,
  cacheKey?: string | number | null,
): string | null {
  if (!logoName || typeof logoName !== 'string' || !logoName.trim()) {
    return null;
  }
  const trimmed = logoName.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const apiBase = String(import.meta.env.VITE_APP_REST_API_BASE_URL ?? '').replace(/\/+$/, '');
  const relativePath = toPublicProductLogoPath(trimmed);
  if (!relativePath) {
    return /^https?:\/\//i.test(trimmed) ? trimmed : null;
  }

  const url = apiBase ? `${apiBase}${relativePath}` : relativePath;
  if (cacheKey == null || cacheKey === '') {
    return url;
  }
  return `${url}?v=${encodeURIComponent(String(cacheKey))}`;
}

function toPublicProductLogoPath(logoName: string | null | undefined): string | null {
  if (!logoName || typeof logoName !== 'string' || !logoName.trim()) {
    return null;
  }
  const trimmed = logoName.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return null;
  }

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const parsed = new URL(trimmed);
      const fromQuery = parsed.searchParams.get('fileName');
      if (fromQuery && isProductLogoFileName(fromQuery)) {
        return `${PRODUCT_LOGO_PUBLIC_DIR}/${fromQuery}`;
      }
      return toPublicProductLogoPath(parsed.pathname);
    }
  } catch {
    return null;
  }

  const slashPath = trimmed.replace(/\\/g, '/');
  const folderMatch = slashPath.match(/Acutis\/Attachment\/Products\/([^/?#]+)/i);
  if (folderMatch?.[1] && isProductLogoFileName(folderMatch[1])) {
    return `${PRODUCT_LOGO_PUBLIC_DIR}/${folderMatch[1]}`;
  }

  const fileName = slashPath.split('/').filter(Boolean).pop() ?? '';
  if (isProductLogoFileName(decodeURIComponent(fileName))) {
    return `${PRODUCT_LOGO_PUBLIC_DIR}/${decodeURIComponent(fileName)}`;
  }

  return null;
}

function isProductLogoFileName(name: string): boolean {
  return /^[\w.-]+\.(jpe?g|png)$/i.test(name);
}

export function toAdminApplication(item: ProductApiItem): AdminApplication {
  const storedLogo = pickProductLogoUrl(item) || '';
  const logoUrl = resolveProductLogoUrl(storedLogo, item.updatedDate) || storedLogo;
  const productName = item.productName || '';
  return {
    id: String(item.productId),
    name: productName,
    shortName: productName,
    category: item.subCategoryName || '',
    icon: logoUrl || DEFAULT_PRODUCT_ICON,
    gradient: DEFAULT_PRODUCT_GRADIENT,
    description: item.prodDescription || '',
    features: Array.isArray(item.features) ? item.features : [],
    productionUrl: item.externalPageUrl || '',
    ownership: 'first-party',
    deploymentModel: 'external-saas',
    licenseType: (item.licenseType === 'free' || item.licenseType === 'licensed')
      ? item.licenseType
      : 'licensed',
    navigationTarget: (item.navigationTarget === 'new-tab' || item.navigationTarget === 'same-tab')
      ? item.navigationTarget
      : 'same-tab',
    status: deriveProductStatus(item),
    registryRef: `reg_app_${String(item.productId).padStart(4, '0')}`,
    sourceLocation: productName.toLowerCase().replace(/\s+/g, '-'),
    updatedAt: item.updatedDate || item.createdDate,
    contactUserId: item.contactUserId != null ? String(item.contactUserId) : '',
    contactPersonName: item.contactPerson || '',
  };
}

export function resolveContactUser(
  app: AdminApplication,
  users: ProductContactUser[]
): AdminApplication {
  const contactUserId = toProductContactUserId(app.contactUserId);
  const rawName = (app.contactPersonName || '').trim();
  if (!contactUserId && !rawName) return app;

  const lower = rawName.toLowerCase();
  const match = users.find(
    (u) =>
      (contactUserId != null && u.userId === contactUserId) ||
      (lower && u.fullName.trim().toLowerCase() === lower)
  );

  if (match) {
    return {
      ...app,
      contactUserId: String(match.userId),
      contactPersonName: match.fullName,
    };
  }

  return {
    ...app,
    contactUserId: app.contactUserId || (contactUserId != null ? String(contactUserId) : ''),
    contactPersonName: app.contactPersonName || rawName,
  };
}

/**
 * Extracts a 4-digit start year from a date string, falling back to the current year.
 */
export function extractStartYear(dateStr: string | null | undefined): string {
  if (!dateStr || typeof dateStr !== 'string') {
    return String(new Date().getFullYear());
  }
  const match = dateStr.match(/\b(20\d{2}|19\d{2})\b/);
  if (match) {
    return match[1];
  }
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getFullYear())) {
    return String(d.getFullYear());
  }
  return String(new Date().getFullYear());
}

/**
 * Formats a unique invoice number in the format INV-{StartYear}-{UniqueSerialNumber}.
 * Example: INV-2026-00263
 * Guarantees no duplicate values even across edge-cases via an optional usedNumbers Set.
 */
export function formatInvoiceNumber(
  startDate: string | null | undefined,
  licenseId: number | string,
  usedNumbers?: Set<string>,
  fallbackIndex?: number,
): string {
  const year = extractStartYear(startDate);
  const idNum = Number(licenseId);
  let serial =
    !Number.isNaN(idNum) && idNum > 0
      ? idNum
      : fallbackIndex != null
        ? fallbackIndex + 1
        : 1;

  let candidate = `INV-${year}-${String(serial).padStart(5, '0')}`;
  if (usedNumbers) {
    while (usedNumbers.has(candidate)) {
      serial++;
      candidate = `INV-${year}-${String(serial).padStart(5, '0')}`;
    }
    usedNumbers.add(candidate);
  }
  return candidate;
}
