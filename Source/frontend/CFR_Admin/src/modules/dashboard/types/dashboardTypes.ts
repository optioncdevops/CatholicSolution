/** Authoritative, SQL-backed platform KPIs from Dashboard/GetDashboardSummary — every count is a
 * real aggregate against its source-of-truth table (see backend DashboardKpiOutput for the exact
 * table/condition behind each field), never inferred from static catalog size. */
export interface DashboardKpisApiItem {
  totalOrganizations: number;
  activeOrganizations: number;
  inactiveOrganizations: number;
  suspendedOrganizations: number;
  totalAcutisUsers: number;
  activeAcutisUsers: number;
  lockedAcutisUsers: number;
  totalOrganizationMembers: number;
  activeOrganizationMembers: number;
  totalProducts: number;
  activeCatalogProducts: number;
  activeProducts: number;
  upcomingProducts: number;
  inactiveProducts: number;
  activeOrganizationProductAssignments: number;
  inactiveOrganizationProductAssignments: number;
  totalAssignedProducts: number;
  totalLicenses: number;
  activeLicenses: number;
  expiringLicenses: number;
  expiredLicenses: number;
  suspendedLicenses: number;
  pendingAccessRequests: number;
  approvedAccessRequests: number;
  rejectedAccessRequests: number;
  infoRequestedAccessRequests: number;
  staleAccessRequests: number;
}

/** Entitlement-integrity metrics — every count here is a condition that should never occur once
 * an access request is correctly provisioned on approval. Non-zero means real data drift. */
export interface DashboardIntegrityApiItem {
  approvedRequestsMissingOrganizationProduct: number;
  approvedRequestsMissingUserProduct: number;
  activeOrganizationProductsWithoutMembers: number;
  activeUserProductsWithoutActiveOrganizationProduct: number;
  duplicateActiveUserProductMappings: number;
  rejectedRequestsWithActiveEntitlements: number;
  expiredLicensesWithActiveOrganizationProduct: number;
  inactiveOrganizationsWithActiveProductAssignments: number;
  totalIssues: number;
}

export type DashboardTrendEventType =
  | 'OrgCreated' | 'RequestSubmitted' | 'RequestApproved' | 'RequestRejected'
  | 'LicenseCreated' | 'OrgProductAssignmentCreated';

/** One raw event timestamp within the requested range — bucketed client-side the same way the
 * dashboard already buckets other real data, except these are scoped server-side to the range. */
export interface DashboardTrendEventApiItem {
  eventType: DashboardTrendEventType;
  eventDate: string;
}

export interface DashboardSummaryApiItem {
  kpis: DashboardKpisApiItem;
  integrity: DashboardIntegrityApiItem;
  trendEvents: DashboardTrendEventApiItem[];
}

/** One row in the Access Integrity panel — a labeled, linkable, severity-tagged view of a single
 * DashboardIntegrityApiItem field. */
export interface IntegrityIssue {
  key: keyof Omit<DashboardIntegrityApiItem, 'totalIssues'>;
  label: string;
  count: number;
  description: string;
  severity: 'warning' | 'error';
  to: string;
}

/** One flagged record behind a single Priority Alerts count — see Dashboard/GetIntegrityIssueDetail.
 * Different issue keys populate different subsets of these fields (e.g. a license-expiry issue
 * has no member; a member-mapping issue has no license), never all of them for one row. */
export interface IntegrityIssueDetailRow {
  orgId: number | null;
  orgName: string | null;
  productId: number | null;
  productName: string | null;
  memberUserId: number | null;
  memberName: string | null;
  detail: string | null;
}
