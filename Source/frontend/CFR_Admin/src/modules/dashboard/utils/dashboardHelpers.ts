import type {
  DashboardIntegrityApiItem, DashboardSummaryApiItem, DashboardTrendEventApiItem, DashboardTrendEventType, IntegrityIssue, IntegrityIssueDetailRow,
} from '../types/dashboardTypes';

//#region Date range + bucketing
export type DateRange = 'today' | '7d' | '30d' | '90d' | 'thisYear' | 'custom';
export type TrendDirection = 'up' | 'down' | 'flat' | 'none';

export interface Trend {
  label: string;
  direction: TrendDirection;
}

export interface RangeBounds {
  start: Date;
  end: Date;
  days: number;
}

export interface Bucket {
  label: string;
  start: Date;
  end: Date;
}

export const RANGE_LABELS: Record<DateRange, string> = {
  today: 'Today', '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', thisYear: 'This Year', custom: 'Custom Range',
};

export const STALE_REQUEST_DAYS = 7;
const DAY_MS = 86_400_000;
/** Dashboard data older than this is flagged stale rather than silently presented as current. */
export const STALE_DATA_MINUTES = 15;

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function computeRangeBounds(range: DateRange, customFrom: string, customTo: string): RangeBounds {
  const now = new Date();
  if (range === 'today') {
    return { start: startOfDay(now), end: endOfDay(now), days: 1 };
  }
  if (range === '7d' || range === '30d' || range === '90d') {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    return { start: startOfDay(new Date(now.getTime() - (days - 1) * DAY_MS)), end: endOfDay(now), days };
  }
  if (range === 'thisYear') {
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.max(1, Math.round((endOfDay(now).getTime() - start.getTime()) / DAY_MS) + 1);
    return { start, end: endOfDay(now), days };
  }
  const parsedFrom = customFrom ? new Date(`${customFrom}T00:00:00`) : startOfDay(new Date(now.getTime() - 29 * DAY_MS));
  const parsedTo = customTo ? new Date(`${customTo}T23:59:59.999`) : endOfDay(now);
  const start = parsedFrom <= parsedTo ? parsedFrom : parsedTo;
  const end = parsedFrom <= parsedTo ? parsedTo : parsedFrom;
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1);
  return { start, end, days };
}

export function previousBounds(bounds: RangeBounds): RangeBounds {
  const end = new Date(bounds.start.getTime() - 1);
  const start = startOfDay(new Date(bounds.start.getTime() - bounds.days * DAY_MS));
  return { start, end, days: bounds.days };
}

export function inBounds(dateStr: string, bounds: RangeBounds): boolean {
  const parsed = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed >= bounds.start && parsed <= bounds.end;
}

// Daily buckets for short ranges, weekly for 30-90 day ranges, monthly for yearly ranges.
export function buildBuckets(bounds: RangeBounds): Bucket[] {
  const { start, end, days } = bounds;
  const buckets: Bucket[] = [];
  if (days <= 14) {
    for (let i = 0; i < days; i++) {
      const bucketStart = startOfDay(new Date(start.getTime() + i * DAY_MS));
      buckets.push({ label: bucketStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), start: bucketStart, end: endOfDay(bucketStart) });
    }
    return buckets;
  }
  if (days <= 200) {
    let cursor = startOfDay(start);
    while (cursor <= end) {
      const bucketEnd = endOfDay(new Date(Math.min(cursor.getTime() + 6 * DAY_MS, end.getTime())));
      buckets.push({ label: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), start: cursor, end: bucketEnd });
      cursor = new Date(bucketEnd.getTime() + 1);
    }
    return buckets;
  }
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    const monthEnd = endOfDay(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0));
    buckets.push({ label: cursor.toLocaleDateString('en-US', { month: 'short' }), start: cursor < start ? start : cursor, end: monthEnd > end ? end : monthEnd });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return buckets;
}

export function bucketCounts(dates: string[], buckets: Bucket[]): number[] {
  return buckets.map(({ start, end }) => dates.filter((date) => {
    const parsed = new Date(date.includes('T') ? date : `${date}T00:00:00`);
    return !Number.isNaN(parsed.getTime()) && parsed >= start && parsed <= end;
  }).length);
}

// Period-over-period comparison for a KPI, derived from real record timestamps already loaded —
// never fabricated. When the previous period has no records to compare against, we say so
// honestly instead of showing a misleading percentage.
export function computeTrend(dates: string[], current: RangeBounds, previous: RangeBounds): Trend {
  const inCurrent = dates.filter((date) => inBounds(date, current)).length;
  const inPrevious = dates.filter((date) => inBounds(date, previous)).length;
  if (inPrevious === 0) {
    if (inCurrent === 0) return { label: 'No comparison data', direction: 'none' };
    return { label: `+${inCurrent} new this period`, direction: 'up' };
  }
  const pct = Math.round(((inCurrent - inPrevious) / inPrevious) * 100);
  if (pct === 0) return { label: 'No change vs previous period', direction: 'flat' };
  return { label: `${pct > 0 ? '+' : ''}${pct}% vs previous period`, direction: pct > 0 ? 'up' : 'down' };
}
//#endregion

//#region Backend-driven trend events
export function normalizeDashboardSummary(resultData: unknown): DashboardSummaryApiItem | null {
  if (!resultData || typeof resultData !== 'object') return null;
  const record = resultData as Partial<DashboardSummaryApiItem>;
  if (!record.kpis || !record.integrity) return null;
  return {
    kpis: record.kpis,
    integrity: record.integrity,
    trendEvents: Array.isArray(record.trendEvents) ? record.trendEvents : [],
  };
}

export function normalizeIntegrityIssueDetail(resultData: unknown): IntegrityIssueDetailRow[] {
  if (!Array.isArray(resultData)) return [];
  return resultData as IntegrityIssueDetailRow[];
}

export function countEventType(events: DashboardTrendEventApiItem[], type: DashboardTrendEventType): number {
  return events.filter((event) => event.eventType === type).length;
}

/** Real period-over-period trend from backend-supplied, range-scoped event counts — never a
 * client-side re-derivation from a full unbounded list. */
export function computeEventTrend(currentEvents: DashboardTrendEventApiItem[], previousEvents: DashboardTrendEventApiItem[], type: DashboardTrendEventType): Trend {
  const inCurrent = countEventType(currentEvents, type);
  const inPrevious = countEventType(previousEvents, type);
  if (inPrevious === 0) {
    if (inCurrent === 0) return { label: 'No comparison data', direction: 'none' };
    return { label: `+${inCurrent} new this period`, direction: 'up' };
  }
  const pct = Math.round(((inCurrent - inPrevious) / inPrevious) * 100);
  if (pct === 0) return { label: 'No change vs previous period', direction: 'flat' };
  return { label: `${pct > 0 ? '+' : ''}${pct}% vs previous period`, direction: pct > 0 ? 'up' : 'down' };
}
//#endregion

//#region Entitlement integrity
/**
 * Turns the flat DashboardIntegrityApiItem into a labeled, linkable, severity-tagged list for the
 * Access Integrity panel. Routes only to real, existing pages/query params this app already
 * supports (organizations list `status` filter, requests list) — never a fabricated filter contract.
 */
export function buildIntegrityIssues(integrity: DashboardIntegrityApiItem): IntegrityIssue[] {
  return [
    {
      key: 'approvedRequestsMissingOrganizationProduct',
      label: 'Approved requests missing an organization grant',
      count: integrity.approvedRequestsMissingOrganizationProduct,
      description: 'The request was approved, but the organization never received an active app assignment for it.',
      severity: 'error',
      to: '/admin/requests',
    },
    {
      key: 'approvedRequestsMissingUserProduct',
      label: 'Approved requests missing a member grant',
      count: integrity.approvedRequestsMissingUserProduct,
      description: "The request was approved, but the requester's own product mapping was never created.",
      severity: 'error',
      to: '/admin/requests',
    },
    {
      key: 'activeOrganizationProductsWithoutMembers',
      label: 'Active app assignments with no members',
      count: integrity.activeOrganizationProductsWithoutMembers,
      description: 'An organization has an active app assignment, but no member is mapped to it.',
      severity: 'warning',
      to: '/admin/organizations',
    },
    {
      key: 'activeUserProductsWithoutActiveOrganizationProduct',
      label: 'Member grants with no active org assignment',
      count: integrity.activeUserProductsWithoutActiveOrganizationProduct,
      description: "A member has an active product mapping, but their organization's assignment for it isn't active.",
      severity: 'warning',
      to: '/admin/organizations',
    },
    {
      key: 'duplicateActiveUserProductMappings',
      label: 'Duplicate member/product mappings',
      count: integrity.duplicateActiveUserProductMappings,
      description: 'The same member has more than one active mapping to the same organization and product.',
      severity: 'warning',
      to: '/admin/organizations',
    },
    {
      key: 'rejectedRequestsWithActiveEntitlements',
      label: 'Rejected requests with active access',
      count: integrity.rejectedRequestsWithActiveEntitlements,
      description: 'The request was rejected, but the requester still has an active mapping to that product.',
      severity: 'error',
      to: '/admin/requests',
    },
    {
      key: 'expiredLicensesWithActiveOrganizationProduct',
      label: 'Expired licenses still granting access',
      count: integrity.expiredLicensesWithActiveOrganizationProduct,
      description: "A license has expired, but the organization's app assignment was never revoked.",
      severity: 'warning',
      to: '/admin/organizations',
    },
    {
      key: 'inactiveOrganizationsWithActiveProductAssignments',
      label: 'Inactive organizations with active app access',
      count: integrity.inactiveOrganizationsWithActiveProductAssignments,
      description: 'The organization is inactive or suspended, but still carries an active app assignment.',
      severity: 'error',
      to: '/admin/organizations?status=inactive',
    },
  ];
}
//#endregion
