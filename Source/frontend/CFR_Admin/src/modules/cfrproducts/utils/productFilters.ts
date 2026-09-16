import type {
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
  { id: 'inactive', label: 'InActive' },
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

export type CustomerFilterId = EffectiveCustomerStatus | 'all' | 'zero-users';

export const CUSTOMER_STATUS_FILTERS: Array<{
  id: CustomerFilterId;
  label: string;
  dot?: string;
}> = [
  { id: 'all', label: 'All Statuses' },
  { id: 'active', label: 'Active', dot: 'var(--success)' },
  { id: 'expiring-soon', label: 'Expiring Soon', dot: 'var(--warning)' },
  { id: 'expired', label: 'Expired', dot: 'var(--error)' },
  { id: 'zero-users', label: '0 Users', dot: 'var(--text-muted)' },
];

/**
 * License status filter pills for the License Details tab.
 */
export const LICENSE_DETAILS_STATUS_FILTERS: Array<{
  id: string;
  label: string;
}> = [
  { id: 'all', label: 'All Statuses' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'expiring-soon', label: 'Expiring Soon' },
];

/**
 * License history status filter options for the License History tab.
 */
export type LicenseHistoryStatusFilter = 'all' | 'paid' | 'unpaid' | 'overdue';

export const LICENSE_HISTORY_STATUS_FILTERS: Array<{
  id: LicenseHistoryStatusFilter;
  label: string;
}> = [
  { id: 'all', label: 'All Invoices' },
  { id: 'paid', label: 'Paid' },
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'overdue', label: 'Overdue' },
];

export const PRODUCT_NAVIGATION_OPTIONS: Array<{ id: ProductNavigationTarget; value: string }> = [
  { id: 'same-tab', value: 'Same Tab' },
  { id: 'new-tab', value: 'New Tab' },
];
