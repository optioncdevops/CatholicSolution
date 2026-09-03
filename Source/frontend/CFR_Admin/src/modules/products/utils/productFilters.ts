import type {
  EffectiveLicenseStatus,
  ProductLicenseType,
  ProductNavigationTarget,
  ProductStatus,
} from '@/modules/types';

/**
 * Filter options for the Products list page status filter pills.
 */
export type ProductStatusFilter = 'all' | 'active' | 'inactive' | 'coming-soon';

export const PRODUCT_STATUS_FILTERS: Array<{ id: ProductStatusFilter; label: string }> = [
  { id: 'all', label: 'All Statuses' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'coming-soon', label: 'Coming Soon' },
];

/**
 * Sort dropdown options on the Products list page.
 */
export const PRODUCT_SORT_OPTIONS = [
  { id: 'default', label: 'Default (DB Order)' },
  { id: 'name', label: 'Name (A–Z)' },
  { id: 'updated', label: 'Recently Updated' },
  { id: 'customers', label: 'Most Customers' },
] as const;

export type ProductSortOption = (typeof PRODUCT_SORT_OPTIONS)[number]['id'];

/**
 * Status choices for Product Change Status modal.
 */
export const PRODUCT_MODAL_STATUS_OPTIONS: ProductStatus[] = ['active', 'inactive', 'coming-soon'];

/**
 * Customer status filter options for the Customers tab in Product Details.
 */
export type EffectiveCustomerStatus = 'active' | 'expiring-soon' | 'expired';

export const CUSTOMER_STATUS_FILTERS: Array<{
  id: EffectiveCustomerStatus | 'all';
  label: string;
  dot?: string;
}> = [
  { id: 'all', label: 'All Statuses' },
  { id: 'active', label: 'Active', dot: 'var(--success)' },
  { id: 'expiring-soon', label: 'Expiring Soon', dot: 'var(--warning)' },
  { id: 'expired', label: 'Expired', dot: 'var(--error)' },
];

/**
 * License status filter pills for the Invoice Details tab.
 */
export const LICENSE_DETAILS_STATUS_FILTERS: Array<{
  id: EffectiveLicenseStatus | 'all';
  label: string;
}> = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'expiring-soon', label: 'Expiring soon' },
];

/**
 * License history status filter options for the License History tab.
 */
export type LicenseHistoryStatusFilter = 'all' | 'active' | 'expiring-soon' | 'expired';

export const LICENSE_HISTORY_STATUS_FILTERS: Array<{
  id: LicenseHistoryStatusFilter;
  label: string;
}> = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'expiring-soon', label: 'Expiring soon' },
  { id: 'expired', label: 'Expired' },
];

/**
 * Form dropdown options for Product Edit form.
 */
export const PRODUCT_LICENSE_TYPE_OPTIONS: Array<{ id: ProductLicenseType; value: string }> = [
  { id: 'free', value: 'Free' },
  { id: 'licensed', value: 'Licensed' },
];

export const PRODUCT_NAVIGATION_OPTIONS: Array<{ id: ProductNavigationTarget; value: string }> = [
  { id: 'same-tab', value: 'Same Tab' },
  { id: 'new-tab', value: 'New Tab' },
];
