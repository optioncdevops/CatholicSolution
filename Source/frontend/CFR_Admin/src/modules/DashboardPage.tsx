import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bar, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, BarChart,
} from 'recharts';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Building2, Check, CheckCircle2,
  Contact, Eye, KeyRound, Layers, Minus, Package, RefreshCw, ShieldAlert, ShieldCheck, Users,
} from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { EntityAvatar } from '@app/components/EntityAvatar';
import { Dropdown } from '@app/components/formControls';
import { CHART_AXIS_TICK, CHART_GRID_STROKE, CHART_HEIGHT, CHART_STATUS_COLORS } from '@app/components/dashboard/chartTheme';
import { ChartTooltip } from '@app/components/dashboard/ChartTooltip';
import { confirmAction } from './lib/confirm';
import { getAllLicenses, getOrganizations } from './organizations/services/organizationsService';
import { normalizeOrganizationsList } from './organizations/utils/organizationHelpers';
import type { LicenseSummaryApiItem, OrganizationApiItem } from './organizations/types/organizationTypes';
import { getUsers, normalizeUsersList } from './users';
import type { UsersApiItem } from './users';
import { getProducts, normalizeProductList, PRODUCTS_PATHS } from './Products';
import type { ProductApiItem } from './Products';
import { getAccessRequests, normalizeAccessRequestList, updateAccessRequestStatus } from './requests';
import type { AccessRequestApiItem, RequestStatus } from './requests';
import RequestReviewModal from './requests/pages/partials/RequestReviewModal';
import { accessStatusOf, daysSince, formatDate, formatRelativeDate } from './utils/formatDate';

type DashboardStatus = 'loading' | 'ready' | 'error';
type DateRange = 'today' | '7d' | '30d' | '90d' | 'thisYear' | 'custom';
type LicenseDisplayStatus = 'active' | 'suspended' | 'expiring-soon' | 'expired';
type ActivityKind = 'organization' | 'product' | 'request';
type TrendDirection = 'up' | 'down' | 'flat' | 'none';

interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  message: string;
  at: string;
}

interface RangeBounds {
  start: Date;
  end: Date;
  days: number;
}

interface Trend {
  label: string;
  direction: TrendDirection;
}

interface Bucket {
  label: string;
  start: Date;
  end: Date;
}

const RANGE_LABELS: Record<DateRange, string> = {
  today: 'Today', '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', thisYear: 'This Year', custom: 'Custom Range',
};
const STALE_REQUEST_DAYS = 7;
const DAY_MS = 86_400_000;

//#region Date range + trend helpers
function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function computeRangeBounds(range: DateRange, customFrom: string, customTo: string): RangeBounds {
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

function previousBounds(bounds: RangeBounds): RangeBounds {
  const end = new Date(bounds.start.getTime() - 1);
  const start = startOfDay(new Date(bounds.start.getTime() - bounds.days * DAY_MS));
  return { start, end, days: bounds.days };
}

function inBounds(dateStr: string, bounds: RangeBounds): boolean {
  const parsed = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed >= bounds.start && parsed <= bounds.end;
}

// Period-over-period comparison for a KPI, derived from real record timestamps already loaded —
// never fabricated. When the previous period has no records to compare against, we say so
// honestly instead of showing a misleading percentage.
function computeTrend(dates: string[], current: RangeBounds, previous: RangeBounds): Trend {
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

// Daily buckets for short ranges, weekly for 30-90 day ranges, monthly for yearly ranges.
function buildBuckets(bounds: RangeBounds): Bucket[] {
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

function bucketCounts(dates: string[], buckets: Bucket[]): number[] {
  return buckets.map(({ start, end }) => dates.filter((date) => {
    const parsed = new Date(date.includes('T') ? date : `${date}T00:00:00`);
    return !Number.isNaN(parsed.getTime()) && parsed >= start && parsed <= end;
  }).length);
}

// A license's effective status is derived from its stored status + expiry date, the same rule
// utils/formatDate.effectiveLicenseStatus encodes — reimplemented narrowly here because
// licenseStatus/expiryDate come back from the API as plain `string`/`string | null`, not that
// helper's stricter literal-union signature.
function licenseDisplayStatus(license: LicenseSummaryApiItem): LicenseDisplayStatus {
  if (license.licenseStatus === 'suspended') return 'suspended';
  if (!license.expiryDate) return 'active';
  return accessStatusOf(license.expiryDate);
}

function activityGroupLabel(at: string): string {
  const days = daysSince(at);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return formatDate(at);
}
//#endregion

const ACTIVITY_ICON: Record<ActivityKind, typeof Package> = {
  organization: Building2, product: Package, request: Layers,
};

//#region Presentational subcomponents
function TrendTag({ trend }: { trend: Trend }) {
  if (trend.direction === 'none') {
    return <span className="block truncate text-[0.6875rem] font-semibold text-[var(--text-faint)]">{trend.label}</span>;
  }
  const toneClass = trend.direction === 'up' ? 'text-[var(--success)]' : trend.direction === 'down' ? 'text-[var(--error)]' : 'text-[var(--text-muted)]';
  const Icon = trend.direction === 'up' ? ArrowUpRight : trend.direction === 'down' ? ArrowDownRight : Minus;
  return (
    <span className={`flex items-center gap-0.5 truncate text-[0.6875rem] font-bold ${toneClass}`}>
      <Icon size={11} className="shrink-0" aria-hidden="true" />
      {trend.label}
    </span>
  );
}

function KpiTile({ icon: Icon, tint, label, value, status, trend, to }: {
  icon: typeof Package; tint: string; label: string; value: number; status: string; trend?: Trend; to: string;
}) {
  return (
    <Link to={to} className="admin-kpi-tile">
      <span className="admin-kpi-tile__icon" style={{ background: tint }} aria-hidden="true"><Icon size={18} /></span>
      <span className="min-w-0">
        <span className="metric-label block text-[var(--text-faint)]">{label}</span>
        <span className="metric-value block leading-tight">{value}</span>
        <span className="block truncate text-[0.6875rem] font-semibold text-[var(--text-muted)]">{status}</span>
        {trend ? <TrendTag trend={trend} /> : null}
      </span>
    </Link>
  );
}

function StatChip({ label, value, tone }: { label: string; value: number; tone: 'success' | 'warning' | 'neutral' | 'danger' | 'info' }) {
  const dotClass: Record<typeof tone, string> = {
    success: 'bg-[var(--success)]', warning: 'bg-[var(--warning)]', neutral: 'bg-[var(--text-faint)]', danger: 'bg-[var(--error)]', info: 'bg-[var(--info)]',
  };
  return (
    <div className="admin-health-tile flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
        <span className={`size-1.5 shrink-0 rounded-full ${dotClass[tone]}`} aria-hidden="true" />
        {label}
      </span>
      <span className="text-sm font-extrabold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 p-4" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => <div key={index} className="admin-skeleton h-9 w-full" />)}
    </div>
  );
}
//#endregion

export function DashboardPage() {
  //#region Hooks
  const { showToast } = useToast();
  const navigate = useNavigate();
  //#endregion

  //#region States
  const [status, setStatus] = useState<DashboardStatus>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<DateRange>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);
  const [hiddenRequestSeries, setHiddenRequestSeries] = useState<Set<string>>(new Set());

  const [organizations, setOrganizations] = useState<OrganizationApiItem[]>([]);
  const [users, setUsers] = useState<UsersApiItem[]>([]);
  const [products, setProducts] = useState<ProductApiItem[]>([]);
  const [requests, setRequests] = useState<AccessRequestApiItem[]>([]);
  const [licenses, setLicenses] = useState<LicenseSummaryApiItem[]>([]);

  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [actingRequestId, setActingRequestId] = useState<number | null>(null);
  //#endregion

  //#region Functions
  // Every domain is fetched independently (Promise.allSettled, not Promise.all) so one failing
  // service degrades that one panel/KPI to an empty state instead of blanking the whole
  // dashboard — the right resilience trade-off when a single page aggregates several domains.
  const loadDashboard = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true); else setStatus('loading');
    setAnnouncement(isRefresh ? 'Refreshing dashboard…' : 'Loading dashboard…');

    const [orgResult, userResult, productResult, requestResult, licenseResult] = await Promise.allSettled([
      getOrganizations(),
      getUsers(),
      getProducts(),
      getAccessRequests(),
      getAllLicenses(),
    ]);

    const errors: string[] = [];

    if (orgResult.status === 'fulfilled') {
      setOrganizations(orgResult.value.statusCode === 204 ? [] : normalizeOrganizationsList(orgResult.value.resultData));
    } else {
      errors.push('Organizations');
    }

    if (userResult.status === 'fulfilled') {
      setUsers(userResult.value.statusCode === 204 ? [] : normalizeUsersList(userResult.value.resultData));
    } else {
      errors.push('Users');
    }

    if (productResult.status === 'fulfilled') {
      setProducts(productResult.value.statusCode === 204 ? [] : normalizeProductList(productResult.value.resultData));
    } else {
      errors.push('Products');
    }

    if (requestResult.status === 'fulfilled') {
      setRequests(requestResult.value.statusCode === 204 ? [] : normalizeAccessRequestList(requestResult.value.resultData));
    } else {
      errors.push('Access Requests');
    }

    if (licenseResult.status === 'fulfilled') {
      const data = licenseResult.value.resultData;
      setLicenses(licenseResult.value.statusCode === 204 || !Array.isArray(data) ? [] : data as LicenseSummaryApiItem[]);
    } else {
      errors.push('Licenses');
    }

    setLoadErrors(errors);
    setLastRefreshedAt(new Date());

    if (errors.length === 5) {
      setStatus('error');
      setAnnouncement('Failed to load the dashboard.');
    } else {
      setStatus('ready');
      setAnnouncement(errors.length > 0 ? `Dashboard loaded with ${errors.length} section(s) unavailable.` : 'Dashboard loaded.');
      if (isRefresh) {
        if (errors.length > 0) showToast(`Refreshed with issues loading: ${errors.join(', ')}.`, 'error');
        else showToast('Dashboard refreshed.', 'success');
      }
    }

    setRefreshing(false);
  }, [showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!cancelled) await loadDashboard(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only fetch; use loadDashboard() for manual refresh/mutations
  }, []);

  //#endregion

  const customRangeError = range === 'custom' && customFrom && customTo && customFrom > customTo
    ? 'Start date must be on or before the end date.'
    : '';
  const currentBounds = useMemo(() => computeRangeBounds(range, customFrom, customTo), [range, customFrom, customTo]);
  const priorBounds = useMemo(() => previousBounds(currentBounds), [currentBounds]);
  const buckets = useMemo(() => buildBuckets(currentBounds), [currentBounds]);

  const activeOrgs = organizations.filter((org) => org.orgStatus === 'active');
  const inactiveOrgs = organizations.filter((org) => org.orgStatus === 'inactive');
  const suspendedOrgs = organizations.filter((org) => org.orgStatus === 'suspended');

  const activeUsers = users.filter((user) => user.isActive === 1 && user.isLocked !== 1);
  const activeProducts = products.filter((product) => product.isActive);
  // Two distinct populations: Acutis Users are platform/admin accounts (this console's own
  // sign-ins); Organization Users are members linked to an organization (org.userCount, already
  // loaded for the Organizations Overview table) — never summed together, since they're different entities.
  const totalOrgUsers = organizations.reduce((sum, org) => sum + (org.userCount || 0), 0);

  const pendingRequests = requests.filter((request) => request.status === 'pending');
  const approvedRequests = requests.filter((request) => request.status === 'approved');
  const rejectedRequests = requests.filter((request) => request.status === 'rejected');
  const infoRequestedRequests = requests.filter((request) => request.status === 'info-requested');
  const rangedPendingRequests = pendingRequests.filter((request) => inBounds(request.submittedAt, currentBounds));
  const oldestPending = pendingRequests.reduce<string | null>((oldest, request) => (
    !oldest || request.submittedAt < oldest ? request.submittedAt : oldest
  ), null);
  const staleRequests = pendingRequests.filter((request) => daysSince(request.submittedAt) >= STALE_REQUEST_DAYS);

  const expiredLicenses = licenses.filter((license) => licenseDisplayStatus(license) === 'expired');
  const expiringLicenses = licenses.filter((license) => licenseDisplayStatus(license) === 'expiring-soon');
  const activeLicenses = licenses.filter((license) => licenseDisplayStatus(license) === 'active');
  const suspendedLicenses = licenses.filter((license) => licenseDisplayStatus(license) === 'suspended');

  const alertsCount = expiredLicenses.length + suspendedOrgs.length + staleRequests.length;

  // Real, timestamp-derived period-over-period trends (never fabricated). Active Users has no
  // creation-date field anywhere in this schema, so it honestly falls back to "No comparison data"
  // rather than showing a misleading percentage.
  const orgTrend = useMemo(
    () => computeTrend(organizations.map((org) => org.insertedDate), currentBounds, priorBounds),
    [organizations, currentBounds, priorBounds],
  );
  const requestTrend = useMemo(
    () => computeTrend(requests.map((request) => request.submittedAt), currentBounds, priorBounds),
    [requests, currentBounds, priorBounds],
  );
  const licenseTrend = useMemo(
    () => computeTrend(licenses.filter((license) => license.createdDate).map((license) => license.createdDate as string), currentBounds, priorBounds),
    [licenses, currentBounds, priorBounds],
  );
  const userTrend: Trend = { label: 'No comparison data', direction: 'none' };
  const appTrend: Trend = { label: 'Catalog size, not a time trend', direction: 'none' };

  const topOrganizations = useMemo(
    () => [...organizations].sort((a, b) => (b.userCount + b.productCount) - (a.userCount + a.productCount)).slice(0, 6),
    [organizations],
  );

  const recentActivity = useMemo<ActivityEntry[]>(() => {
    const orgEvents: ActivityEntry[] = organizations
      .filter((org) => org.insertedDate)
      .map((org) => ({ id: `org-${org.orgId}`, kind: 'organization', message: `${org.orgName} was added as an organization`, at: org.insertedDate }));
    const productEvents: ActivityEntry[] = products
      .filter((product) => product.updatedDate)
      .map((product) => ({ id: `product-${product.productId}`, kind: 'product', message: `${product.productName} was updated`, at: product.updatedDate as string }));
    const requestEvents: ActivityEntry[] = requests
      .filter((request) => request.submittedAt)
      .map((request) => ({ id: `request-${request.accessRequestId}`, kind: 'request', message: `${request.requesterName} requested ${request.productName} for ${request.organizationName}`, at: request.submittedAt }));

    const seen = new Set<string>();
    return [...orgEvents, ...productEvents, ...requestEvents]
      .filter((entry) => inBounds(entry.at, currentBounds))
      .sort((a, b) => b.at.localeCompare(a.at))
      .filter((entry) => {
        const dedupeKey = `${entry.kind}:${entry.message}:${entry.at}`;
        if (seen.has(dedupeKey)) return false;
        seen.add(dedupeKey);
        return true;
      });
  }, [organizations, products, requests, currentBounds]);

  const groupedActivity = useMemo(() => {
    const groups: { label: string; items: ActivityEntry[] }[] = [];
    for (const item of recentActivity.slice(0, 12)) {
      const label = activityGroupLabel(item.at);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.label === label) lastGroup.items.push(item);
      else groups.push({ label, items: [item] });
    }
    return groups;
  }, [recentActivity]);

  // Requests Trend chart data — a stacked bar per time bucket, never a line, so sparse request
  // volume reads as discrete counts rather than a misleadingly continuous trend.
  const requestChartData = useMemo(() => {
    const byStatus = (statusValue: RequestStatus) => requests.filter((request) => request.status === statusValue).map((request) => request.submittedAt);
    const pending = bucketCounts(byStatus('pending'), buckets);
    const approved = bucketCounts(byStatus('approved'), buckets);
    const rejected = bucketCounts(byStatus('rejected'), buckets);
    const infoRequested = bucketCounts(byStatus('info-requested'), buckets);
    return buckets.map((bucket, index) => ({
      name: bucket.label, Pending: pending[index], Approved: approved[index], Rejected: rejected[index], 'Info Requested': infoRequested[index],
    }));
  }, [requests, buckets]);
  const requestsInRangeTotal = rangedPendingRequests.length + approvedRequests.filter((r) => inBounds(r.submittedAt, currentBounds)).length
    + rejectedRequests.filter((r) => inBounds(r.submittedAt, currentBounds)).length + infoRequestedRequests.filter((r) => inBounds(r.submittedAt, currentBounds)).length;
  const hasRequestSeriesData = requestsInRangeTotal > 0;

  const orgStatusPieData = [
    { key: 'active', name: 'Active', value: activeOrgs.length, color: CHART_STATUS_COLORS.success, filter: 'active' },
    { key: 'inactive', name: 'Inactive', value: inactiveOrgs.length, color: CHART_STATUS_COLORS.neutral, filter: 'inactive' },
    { key: 'suspended', name: 'Suspended', value: suspendedOrgs.length, color: CHART_STATUS_COLORS.danger, filter: 'suspended' },
  ];

  const licenseHealthData = [{
    name: 'Licenses',
    Active: activeLicenses.length,
    'Expiring Soon': expiringLicenses.length,
    Expired: expiredLicenses.length,
    Suspended: suspendedLicenses.length,
  }];
  const hasLicenseHealthData = licenses.length > 0;

  //#region Handlers
  const handleRefresh = () => { void loadDashboard(true); };

  const toggleRequestSeries = (dataKey: string) => {
    setHiddenRequestSeries((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey); else next.add(dataKey);
      return next;
    });
  };

  const handleQuickAction = async (request: AccessRequestApiItem, nextStatus: 'approved' | 'rejected') => {
    const confirmed = await confirmAction({
      title: nextStatus === 'approved' ? 'Approve this request?' : 'Reject this request?',
      description: `${request.requesterName}'s request for ${request.productName} at ${request.organizationName} will be marked ${nextStatus}. This cannot be undone from here.`,
      confirmLabel: nextStatus === 'approved' ? 'Approve' : 'Reject',
      tone: nextStatus === 'approved' ? 'primary' : 'danger',
    });
    if (!confirmed) return;

    setActingRequestId(request.accessRequestId);
    try {
      await updateAccessRequestStatus({ accessRequestId: request.accessRequestId, status: nextStatus });
      showToast(`${request.requesterName}'s request ${nextStatus}.`, 'success');
      await loadDashboard(true);
    } catch (error) {
      console.error('Error updating access request:', error);
      showToast(typeof error === 'string' ? error : 'Failed to update the request.', 'error');
    } finally {
      setActingRequestId(null);
    }
  };
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>

      <PanelHeader
        title="Dashboard"
        action={(
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-40 shrink-0">
              <Dropdown
                label="Date range" hideLabel searchable={false} clearable={false}
                value={range}
                onValueChange={(value) => setRange((value as DateRange) ?? '30d')}
                options={(Object.keys(RANGE_LABELS) as DateRange[]).map((option) => ({ id: option, value: RANGE_LABELS[option] }))}
                className="min-h-8"
              />
            </div>
            {range === 'custom' ? (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="date" aria-label="Custom range start date" aria-invalid={Boolean(customRangeError)}
                    value={customFrom} onChange={(event) => setCustomFrom(event.target.value)}
                    className="h-8 rounded-[var(--admin-control-radius)] border border-[var(--line-strong)] bg-[var(--surface)] px-2 text-[length:var(--admin-text-base)] font-semibold text-[var(--text-primary)]"
                  />
                  <span className="text-xs text-[var(--text-faint)]">to</span>
                  <input
                    type="date" aria-label="Custom range end date" aria-invalid={Boolean(customRangeError)}
                    value={customTo} onChange={(event) => setCustomTo(event.target.value)}
                    className="h-8 rounded-[var(--admin-control-radius)] border border-[var(--line-strong)] bg-[var(--surface)] px-2 text-[length:var(--admin-text-base)] font-semibold text-[var(--text-primary)]"
                  />
                </div>
                {customRangeError ? <span className="text-[0.6875rem] font-bold text-[var(--error)]">{customRangeError}</span> : null}
              </div>
            ) : null}
            <CommonButton variant="headerSecondary" iconLeft={<RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />} onClick={handleRefresh} disabled={refreshing || status === 'loading'}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </CommonButton>
            <CommonButton variant="headerSecondary" iconLeft={<Building2 size={14} />} onClick={() => navigate('/admin/organizations/add')}>Add Organization</CommonButton>
          </div>
        )}
      />
      <p className="-mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
        <span>Platform-wide status for organizations, users, apps, requests, and licenses.</span>
        {lastRefreshedAt ? <span className="font-semibold text-[var(--text-faint)]">Last refreshed {lastRefreshedAt.toLocaleTimeString()}</span> : null}
      </p>

      {refreshing ? (
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]" aria-hidden="true">
          <div className="h-full w-1/3 animate-[slide-in-right_900ms_ease-in-out_infinite] rounded-full bg-[var(--secondary)]" />
        </div>
      ) : null}

      {status === 'error' ? (
        <EmptyState
          icon="⚠️"
          title="Couldn't load the dashboard"
          description="None of the platform data sources responded. Check your connection and try again."
          actionLabel="Retry"
          onAction={() => void loadDashboard(false)}
        />
      ) : status === 'loading' ? (
        <>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7" aria-busy="true" aria-label="Loading dashboard">
            {Array.from({ length: 7 }).map((_, index) => <div key={index} className="admin-skeleton h-[4.5rem] w-full" />)}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="admin-panel-card"><SectionSkeleton rows={6} /></section>
            <section className="admin-panel-card"><SectionSkeleton rows={6} /></section>
          </div>
        </>
      ) : (
        <>
          {loadErrors.length > 0 ? (
            <div role="alert" className="flex items-start gap-2 rounded-[var(--radius-panel)] border border-[var(--warning)] bg-[var(--warning-bg)] p-3">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[var(--warning)]" aria-hidden="true" />
              <p className="text-xs font-semibold text-[var(--warning)]">
                Couldn't load: {loadErrors.join(', ')}. Those sections show as empty below — try refreshing.
              </p>
            </div>
          ) : null}

          {/* KPI summary row */}
          <div className="admin-reveal-stagger grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            <KpiTile
              icon={Building2} tint="linear-gradient(135deg,#166534,#22C55E)" to="/admin/organizations"
              label="Organizations" value={organizations.length} trend={orgTrend}
              status={`${activeOrgs.length} active · ${suspendedOrgs.length} suspended`}
            />
            <KpiTile
              icon={Users} tint="linear-gradient(135deg,#5B21B6,#8B5CF6)" to="/admin/users"
              label="Acutis Users" value={activeUsers.length} trend={userTrend}
              status={`${activeUsers.length} active of ${users.length} total`}
            />
            <KpiTile
              icon={Contact} tint="linear-gradient(135deg,#9D174D,#EC4899)" to="/admin/organizations"
              label="Organization Users" value={totalOrgUsers} trend={{ label: 'Members linked to organizations', direction: 'none' }}
              status={`across ${organizations.length} organization${organizations.length === 1 ? '' : 's'}`}
            />
            <KpiTile
              icon={Package} tint="linear-gradient(135deg,#1E3A8A,#3B82F6)" to={PRODUCTS_PATHS.list}
              label="Active Apps" value={activeProducts.length} trend={appTrend}
              status={`${activeProducts.length} of ${products.length} catalog apps`}
            />
            <KpiTile
              icon={Layers} tint="linear-gradient(135deg,#B45309,#F59E0B)" to="/admin/requests"
              label="Pending Requests" value={pendingRequests.length} trend={requestTrend}
              status={pendingRequests.length > 0 ? `${pendingRequests.length} require review` : 'Nothing pending'}
            />
            <KpiTile
              icon={KeyRound} tint="linear-gradient(135deg,#0F766E,#34D399)" to="/admin/organizations"
              label="Licenses" value={licenses.length} trend={licenseTrend}
              status={expiringLicenses.length > 0 ? `${expiringLicenses.length} expiring soon` : `${expiredLicenses.length} expired`}
            />
            <KpiTile
              icon={ShieldAlert} tint="linear-gradient(135deg,#991B1B,#EF4444)" to="/admin/organizations"
              label="Alerts / Issues" value={alertsCount}
              status={alertsCount > 0 ? `${expiredLicenses.length} expired · ${suspendedOrgs.length} suspended · ${staleRequests.length} stale` : 'Nothing needs attention'}
            />
          </div>

          {/* Priority alerts / action banner */}
          {alertsCount > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-panel)] border border-[var(--warning)] bg-[var(--warning-bg)] px-4 py-2.5">
              <span className="flex items-center gap-2 text-xs font-bold text-[var(--warning)]">
                <ShieldAlert size={15} className="shrink-0" aria-hidden="true" />
                {alertsCount} item{alertsCount === 1 ? '' : 's'} need{alertsCount === 1 ? 's' : ''} attention: {expiredLicenses.length} expired license{expiredLicenses.length === 1 ? '' : 's'}, {suspendedOrgs.length} suspended org{suspendedOrgs.length === 1 ? '' : 's'}, {staleRequests.length} stale request{staleRequests.length === 1 ? '' : 's'}.
              </span>
              <CommonButton variant="outline" size="sm" onClick={() => navigate('/admin/organizations')}>Review</CommonButton>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-[var(--radius-panel)] border border-[var(--success)] bg-[var(--success-bg)] px-4 py-2.5 text-xs font-bold text-[var(--success)]">
              <ShieldCheck size={15} className="shrink-0" aria-hidden="true" />
              All systems normal — no expired licenses, suspended organizations, or stale requests right now.
            </div>
          )}

          {/* Main analytics row: organization status donut + requests trend */}
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Organization Status</h2>
                  <p className="panel-subtitle">Click a segment or legend row to filter the organization list.</p>
                </div>
              </div>
              {organizations.length === 0 ? (
                <EmptyState icon="🏢" title="No organizations yet" description="Organizations added to the platform will appear here." />
              ) : (
                <div className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
                  <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={orgStatusPieData.filter((segment) => segment.value > 0)}
                          dataKey="value" nameKey="name"
                          innerRadius={52} outerRadius={76} paddingAngle={orgStatusPieData.filter((s) => s.value > 0).length > 1 ? 3 : 0}
                          isAnimationActive={false}
                          onClick={(entry) => navigate(`/admin/organizations?status=${(entry as unknown as { filter: string }).filter}`)}
                          cursor="pointer"
                        >
                          {orgStatusPieData.filter((segment) => segment.value > 0).map((segment) => (
                            <Cell key={segment.key} fill={segment.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={ChartTooltip} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center" aria-hidden="true">
                      <div>
                        <span className="block text-xl font-extrabold leading-none text-[var(--text-primary)]">{organizations.length}</span>
                        <span className="mt-0.5 block text-[0.5625rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Total</span>
                      </div>
                    </div>
                    <span className="sr-only">
                      {organizations.length} organizations total: {orgStatusPieData.map((segment) => `${segment.name} ${segment.value}`).join(', ')}
                    </span>
                  </div>
                  <ul className="flex w-full max-w-[14rem] flex-col gap-1.5">
                    {orgStatusPieData.map((segment) => (
                      <li key={segment.key}>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/organizations?status=${segment.filter}`)}
                          className="flex w-full items-center justify-between gap-2 rounded-[var(--admin-control-radius)] px-2 py-1.5 text-left text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover)]"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 shrink-0 rounded-full" style={{ background: segment.color }} aria-hidden="true" />
                            {segment.name}
                          </span>
                          <span className="font-bold text-[var(--text-primary)]">
                            {segment.value} · {organizations.length === 0 ? 0 : Math.round((segment.value / organizations.length) * 100)}%
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Requests Trend</h2>
                  <p className="panel-subtitle">{RANGE_LABELS[range]} · {requestsInRangeTotal} request{requestsInRangeTotal === 1 ? '' : 's'} total</p>
                </div>
              </div>
              {requests.length === 0 ? (
                <EmptyState icon="📥" title="No requests yet" description="Access requests will show up here as they arrive." />
              ) : (
                <div className="flex flex-col gap-2 p-4">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <StatChip label="Pending" value={pendingRequests.length} tone="warning" />
                    <StatChip label="Approved" value={approvedRequests.length} tone="success" />
                    <StatChip label="Rejected" value={rejectedRequests.length} tone="danger" />
                    <StatChip label="Info Requested" value={infoRequestedRequests.length} tone="info" />
                  </div>
                  {!hasRequestSeriesData ? (
                    <EmptyState icon="🗓️" title="No requests in this range" description="Try widening the date range to chart request activity." />
                  ) : (
                    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                      <BarChart data={requestChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                        <XAxis dataKey="name" tick={CHART_AXIS_TICK} axisLine={{ stroke: CHART_GRID_STROKE }} tickLine={false} />
                        <YAxis allowDecimals={false} tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} width={28} />
                        <RechartsTooltip content={ChartTooltip} cursor={{ fill: 'var(--hover)' }} />
                        <Legend
                          onClick={(entry) => toggleRequestSeries(String(entry.dataKey))}
                          formatter={(value) => <span className={hiddenRequestSeries.has(value) ? 'text-[var(--text-faint)] line-through' : 'text-[var(--text-secondary)]'}>{value}</span>}
                          wrapperStyle={{ fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                        />
                        <Bar dataKey="Pending" stackId="requests" fill={CHART_STATUS_COLORS.warning} hide={hiddenRequestSeries.has('Pending')} radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Approved" stackId="requests" fill={CHART_STATUS_COLORS.success} hide={hiddenRequestSeries.has('Approved')} />
                        <Bar dataKey="Rejected" stackId="requests" fill={CHART_STATUS_COLORS.danger} hide={hiddenRequestSeries.has('Rejected')} />
                        <Bar dataKey="Info Requested" stackId="requests" fill={CHART_STATUS_COLORS.info} hide={hiddenRequestSeries.has('Info Requested')} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Operational row: organizations overview + requests/approvals */}
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Organizations Overview</h2>
                  <p className="panel-subtitle">Top organizations ranked by linked users and active app assignments.</p>
                </div>
                <Link to="/admin/organizations" className="text-xs font-bold text-[var(--primary)] hover:underline">View All</Link>
              </div>
              {topOrganizations.length === 0 ? (
                <EmptyState icon="🏢" title="No organizations yet" description="Organizations added to the platform will appear here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <caption className="sr-only">Top organizations by activity</caption>
                    <thead>
                      <tr>
                        <th scope="col">Organization</th>
                        <th scope="col">Status</th>
                        <th scope="col">Users</th>
                        <th scope="col">Apps</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topOrganizations.map((org) => (
                        <tr key={org.orgId} className="cursor-pointer" onClick={() => navigate(`/admin/organizations/${org.orgId}`)}>
                          <td>
                            <span className="flex items-center gap-2.5 font-bold text-[var(--text-primary)]">
                              <EntityAvatar name={org.orgName} size={26} />
                              <span className="truncate">{org.orgName}</span>
                            </span>
                          </td>
                          <td><StatusBadge status={org.orgStatus} kind="organization" /></td>
                          <td className="text-[var(--text-secondary)]">{org.userCount}</td>
                          <td className="text-[var(--text-secondary)]">{org.productCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Requests &amp; Approvals</h2>
                  <p className="panel-subtitle">Pending · {RANGE_LABELS[range].toLowerCase()}{oldestPending ? ` · Oldest: ${formatRelativeDate(oldestPending)}` : ''}</p>
                </div>
                <Link to="/admin/requests" className="text-xs font-bold text-[var(--primary)] hover:underline">View All</Link>
              </div>
              {pendingRequests.length === 0 ? (
                <EmptyState icon="✅" title="Nothing pending" description="New access requests will show up here as they arrive." />
              ) : rangedPendingRequests.length === 0 ? (
                <EmptyState icon="🗓️" title="No requests in this range" description={`No pending requests were submitted in the ${RANGE_LABELS[range].toLowerCase()}. Try widening the date range.`} />
              ) : (
                <ul className="divide-y divide-[var(--line-soft)]">
                  {rangedPendingRequests.slice(0, 5).map((request) => {
                    const isStale = daysSince(request.submittedAt) >= STALE_REQUEST_DAYS;
                    return (
                      <li key={request.accessRequestId} className="flex items-center gap-2.5 px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedRequestId(request.accessRequestId)}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                        >
                          <EntityAvatar name={request.requesterName} size={28} />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="block truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{request.requesterName}</span>
                              {isStale ? <span className="shrink-0 rounded-full bg-[var(--warning-bg)] px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-[var(--warning)]">Stale</span> : null}
                            </span>
                            <span className="block truncate text-xs text-[var(--text-muted)]">{request.organizationName} · {request.productName}</span>
                            <span className="block truncate text-[0.6875rem] font-semibold text-[var(--text-faint)]">Requested {formatRelativeDate(request.submittedAt)}</span>
                          </span>
                        </button>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <CommonIconButton
                            aria-label={`Approve ${request.requesterName}'s request`}
                            icon={<Check size={15} />}
                            onClick={() => void handleQuickAction(request, 'approved')}
                            disabled={actingRequestId === request.accessRequestId}
                          />
                          <CommonIconButton
                            aria-label={`View ${request.requesterName}'s request`}
                            variant="secondary"
                            icon={<Eye size={15} />}
                            onClick={() => setSelectedRequestId(request.accessRequestId)}
                            disabled={actingRequestId === request.accessRequestId}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* Recent activity + license health row */}
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Recent Activity</h2>
                  <p className="panel-subtitle">{RANGE_LABELS[range]} · new organizations, product updates, and access requests</p>
                </div>
                <Link to="/admin/requests" className="text-xs font-bold text-[var(--primary)] hover:underline">View all activity</Link>
              </div>
              {recentActivity.length === 0 ? (
                <EmptyState icon="🕒" title="No activity in this range" description="Try widening the date range to see older activity." />
              ) : (
                <div className="flex flex-col gap-3 p-4">
                  {groupedActivity.map((group) => (
                    <div key={group.label} className="flex flex-col gap-2">
                      <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">{group.label}</p>
                      <ul className="flex flex-col gap-2.5">
                        {group.items.map((item) => {
                          const Icon = ACTIVITY_ICON[item.kind];
                          return (
                            <li key={item.id} className="flex items-start gap-2.5 text-[0.8125rem]">
                              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)]" aria-hidden="true">
                                <Icon size={12} />
                              </span>
                              <div className="min-w-0">
                                <p className="text-[var(--text-primary)]">{item.message}</p>
                                <p className="text-xs text-[var(--text-muted)]">{formatRelativeDate(item.at)}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-panel-card">
              <div className="admin-panel-card__header"><h2 className="panel-title">License Health</h2></div>
              {!hasLicenseHealthData ? (
                <EmptyState icon="🔑" title="No licenses yet" description="Licenses issued to organizations will appear here." />
              ) : (
                <div className="flex flex-col gap-2 p-4">
                  <ResponsiveContainer width="100%" height={70}>
                    <BarChart data={licenseHealthData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" hide />
                      <RechartsTooltip content={ChartTooltip} cursor={{ fill: 'var(--hover)' }} />
                      <Bar dataKey="Active" stackId="health" fill={CHART_STATUS_COLORS.success} barSize={28} radius={[3, 0, 0, 3]} />
                      <Bar dataKey="Expiring Soon" stackId="health" fill={CHART_STATUS_COLORS.warning} barSize={28} />
                      <Bar dataKey="Expired" stackId="health" fill={CHART_STATUS_COLORS.danger} barSize={28} />
                      <Bar dataKey="Suspended" stackId="health" fill={CHART_STATUS_COLORS.neutral} barSize={28} radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <ul className="grid grid-cols-2 gap-2">
                    <StatChip label="Active" value={activeLicenses.length} tone="success" />
                    <StatChip label="Expiring soon" value={expiringLicenses.length} tone="warning" />
                    <StatChip label="Expired" value={expiredLicenses.length} tone="danger" />
                    <StatChip label="Suspended" value={suspendedLicenses.length} tone="neutral" />
                  </ul>
                  {expiringLicenses.length > 0 || expiredLicenses.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => navigate('/admin/organizations')}
                      className="flex items-center gap-1.5 text-left text-[0.6875rem] font-bold text-[var(--warning)] hover:underline"
                    >
                      <AlertTriangle size={12} className="shrink-0" aria-hidden="true" />
                      {expiringLicenses.length} expiring soon and {expiredLicenses.length} already expired — review from the organization's Licenses tab.
                    </button>
                  ) : null}
                </div>
              )}
            </section>
          </div>

          <p className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-faint)]">
            <Activity size={12} className="shrink-0" aria-hidden="true" />
            CFR Acutis Admin Dashboard{lastRefreshedAt ? ` · Data last refreshed ${lastRefreshedAt.toLocaleTimeString()}` : ''}
            {status === 'ready' && expiringLicenses.length > 0 ? (
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-[var(--success)]" /> {expiringLicenses.length} license{expiringLicenses.length === 1 ? '' : 's'} expiring soon</span>
            ) : null}
          </p>
        </>
      )}

      <RequestReviewModal
        accessRequestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
        onResolved={() => loadDashboard(true)}
      />
    </div>
  );
  //#endregion
}
