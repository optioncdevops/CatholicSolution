import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bar, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, BarChart,
} from 'recharts';
import {
  Activity, AlertTriangle, Building2, Check, CheckCircle2,
  Clock, Eye, KeyRound, Layers, LinkIcon, Package, RefreshCw, ShieldAlert,
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
import { getOrganizations } from './organizations/services/organizationsService';
import { normalizeOrganizationsList } from './organizations/utils/organizationHelpers';
import type { OrganizationApiItem } from './organizations/types/organizationTypes';
import { getAccessRequests, normalizeAccessRequestList, updateAccessRequestStatus } from './requests';
import type { AccessRequestApiItem, RequestStatus } from './requests';
import RequestReviewModal from './requests/pages/partials/RequestReviewModal';
import { getProductAssignmentSummary, PRODUCTS_PATHS } from './cfrproducts';
import type { ProductAssignmentSummaryApiItem } from './cfrproducts';
import {
  bucketCounts, buildBuckets, computeRangeBounds,
  getDashboardSummary, inBounds, normalizeDashboardSummary,
  RANGE_LABELS, STALE_DATA_MINUTES, STALE_REQUEST_DAYS,
} from './dashboard';
import type { DashboardSummaryApiItem, DateRange } from './dashboard';
import { daysSince, formatDate, formatRelativeDate } from './utils/formatDate';

type DashboardStatus = 'loading' | 'ready' | 'error';
type ActivityKind = 'organization' | 'request' | 'license' | 'assignment';
type AlertSeverity = 'warning' | 'error';

interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  message: string;
  at: string;
  /** Route to navigate to when this entry is clicked — every entry names a real record, so every
   * entry should be able to link to it (an organization, or the request review modal via onSelect). */
  to?: string;
  /** Alternative to `to` for entries that open something other than a route (e.g. a modal). */
  onSelect?: () => void;
}

interface AlertRow {
  key: string;
  label: string;
  count: number;
  description: string;
  severity: AlertSeverity;
  to: string;
}

// The backend summary's trendEvents result set is date-scoped, but every section on this page now
// filters that (already-loaded) data client-side with its own local range — so a single fetch
// covering a generous window is enough to back every section's filter without refetching per
// filter change. This reuses the existing Dashboard/GetDashboardSummary contract as-is; the
// backend (DashboardService.MaximumRangeDays) rejects any range over 366 days, so this must stay
// strictly under that ceiling.
const SUMMARY_WINDOW_DAYS = 365;
const ACTIVITY_RANGE_OPTIONS: DateRange[] = ['today', '7d', '30d', '90d', 'custom'];
const REQUEST_RANGE_OPTIONS: DateRange[] = ['today', '7d', '30d', '90d', 'thisYear', 'custom'];
const ORG_TREND_RANGE_OPTIONS: DateRange[] = ['7d', '30d', '90d'];

function activityGroupLabel(at: string): string {
  const days = daysSince(at);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return formatDate(at);
}

const ACTIVITY_ICON: Record<ActivityKind, typeof Package> = {
  organization: Building2, request: Layers, license: KeyRound, assignment: LinkIcon,
};

//#region Presentational subcomponents
function KpiTile({ id, icon: Icon, tint, label, value, status, to }: {
  id: string; icon: typeof Package; tint: string; label: string; value: number; status: string; to: string;
}) {
  const content = (
    <>
      <span className="admin-kpi-tile__icon" style={{ background: tint }} aria-hidden="true"><Icon size={18} /></span>
      <span className="min-w-0">
        <span className="metric-label block text-[var(--text-faint)]">{label}</span>
        <span className="metric-value block leading-tight">{value}</span>
        <span className="block truncate text-[0.6875rem] font-semibold text-[var(--text-muted)]">{status}</span>
      </span>
    </>
  );
  if (to.startsWith('#')) {
    return <a id={id} href={to} className="admin-kpi-tile">{content}</a>;
  }
  return <Link id={id} to={to} className="admin-kpi-tile">{content}</Link>;
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

/** Section-scoped date range control — each section owns its own filter state, so changing one
 * section's range never affects any other section's data (per-section filtering, not one global
 * dashboard-wide filter). `filterId`/`idPrefix` follow the Stable Control IDs standard: the
 * dropdown gets `ddl{FilterId}` and the custom-range inputs get `dtp{FilterId}From`/`...To`. */
function RangeFilterControl({ filterId, idPrefix, value, onChange, options, customFrom, customTo, onCustomFromChange, onCustomToChange, error }: {
  filterId: string; idPrefix: string; value: DateRange; onChange: (value: DateRange) => void; options: DateRange[];
  customFrom: string; customTo: string; onCustomFromChange: (value: string) => void; onCustomToChange: (value: string) => void; error: string;
}) {
  return (
    <div id={`filter${filterId}`} className="flex flex-wrap items-center gap-1.5">
      <div className="w-36 shrink-0">
        <Dropdown
          id={`ddl${filterId}`}
          label={`${idPrefix} date range`} hideLabel searchable={false} clearable={false}
          value={value}
          onValueChange={(next) => onChange((next as DateRange) ?? options[0])}
          options={options.map((option) => ({ id: option, value: RANGE_LABELS[option] }))}
          className="min-h-8"
        />
      </div>
      {value === 'custom' ? (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <input
              id={`dtp${filterId}From`}
              type="date" aria-label={`${idPrefix} custom range start date`} aria-invalid={Boolean(error)}
              value={customFrom} onChange={(event) => onCustomFromChange(event.target.value)}
              className="h-8 rounded-[var(--admin-control-radius)] border border-[var(--line-strong)] bg-[var(--surface)] px-2 text-[length:var(--admin-text-base)] font-semibold text-[var(--text-primary)]"
            />
            <span className="text-xs text-[var(--text-faint)]">to</span>
            <input
              id={`dtp${filterId}To`}
              type="date" aria-label={`${idPrefix} custom range end date`} aria-invalid={Boolean(error)}
              value={customTo} onChange={(event) => onCustomToChange(event.target.value)}
              className="h-8 rounded-[var(--admin-control-radius)] border border-[var(--line-strong)] bg-[var(--surface)] px-2 text-[length:var(--admin-text-base)] font-semibold text-[var(--text-primary)]"
            />
          </div>
          {error ? <span className="text-[0.6875rem] font-bold text-[var(--error)]">{error}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Full-width group heading used above each dashboard section — title, subtitle, and an optional
 * right-aligned slot for a section-local filter and/or a "View all" link. */
function SectionHeading({ id, title, subtitle, right }: { id: string; title: string; subtitle: string; right?: React.ReactNode }) {
  return (
    <div id={id} className="flex flex-wrap items-center justify-between gap-2 px-0.5">
      <div>
        <h2 className="text-sm font-extrabold text-[var(--text-primary)]">{title}</h2>
        <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
      </div>
      {right ? <div className="flex shrink-0 items-center gap-2">{right}</div> : null}
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
  const [announcement, setAnnouncement] = useState('');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);
  const [hiddenRequestSeries, setHiddenRequestSeries] = useState<Set<string>>(new Set());

  const [organizations, setOrganizations] = useState<OrganizationApiItem[]>([]);
  const [requests, setRequests] = useState<AccessRequestApiItem[]>([]);
  const [summary, setSummary] = useState<DashboardSummaryApiItem | null>(null);
  const [assignmentSummary, setAssignmentSummary] = useState<ProductAssignmentSummaryApiItem[]>([]);

  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [actingRequestId, setActingRequestId] = useState<number | null>(null);

  // Section-local filters — each section's range only ever affects that section's own data.
  const [requestRange, setRequestRange] = useState<DateRange>('30d');
  const [requestCustomFrom, setRequestCustomFrom] = useState('');
  const [requestCustomTo, setRequestCustomTo] = useState('');
  const [activityRange, setActivityRange] = useState<DateRange>('7d');
  const [activityCustomFrom, setActivityCustomFrom] = useState('');
  const [activityCustomTo, setActivityCustomTo] = useState('');
  const [orgTrendRange, setOrgTrendRange] = useState<DateRange>('30d');
  //#endregion

  const requestRangeError = requestRange === 'custom' && requestCustomFrom && requestCustomTo && requestCustomFrom > requestCustomTo
    ? 'Start date must be on or before the end date.' : '';
  const activityRangeError = activityRange === 'custom' && activityCustomFrom && activityCustomTo && activityCustomFrom > activityCustomTo
    ? 'Start date must be on or before the end date.' : '';

  const requestBounds = useMemo(() => computeRangeBounds(requestRange, requestCustomFrom, requestCustomTo), [requestRange, requestCustomFrom, requestCustomTo]);
  const requestBuckets = useMemo(() => buildBuckets(requestBounds), [requestBounds]);
  const activityBounds = useMemo(() => computeRangeBounds(activityRange, activityCustomFrom, activityCustomTo), [activityRange, activityCustomFrom, activityCustomTo]);
  const orgTrendBounds = useMemo(() => computeRangeBounds(orgTrendRange, '', ''), [orgTrendRange]);
  const orgTrendBuckets = useMemo(() => buildBuckets(orgTrendBounds), [orgTrendBounds]);

  //#region Functions
  // Organizations and requests are fetched in full (no date param) — every section that shows
  // per-record detail (Organizations Overview, Requests & Approvals, Recent Activity) filters that
  // full list client-side with its own local range, so one section's filter never touches another
  // section's data. The dashboard summary is fetched once, with a fixed generous window, purely so
  // its trend events can back the optional "created over time" / recent-activity views — every
  // platform KPI and entitlement-integrity count in it is a current snapshot, unaffected by dates.
  const loadDashboard = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true); else setStatus('loading');
    setAnnouncement(isRefresh ? 'Refreshing dashboard…' : 'Loading dashboard…');

    const windowEnd = new Date();
    const windowStart = new Date(windowEnd.getTime() - SUMMARY_WINDOW_DAYS * 86_400_000);

    const [orgResult, requestResult, summaryResult, assignmentResult] = await Promise.allSettled([
      getOrganizations(),
      getAccessRequests(),
      getDashboardSummary(windowStart.toISOString(), windowEnd.toISOString()),
      getProductAssignmentSummary(),
    ]);

    const errors: string[] = [];

    if (orgResult.status === 'fulfilled') {
      setOrganizations(orgResult.value.statusCode === 204 ? [] : normalizeOrganizationsList(orgResult.value.resultData));
    } else {
      errors.push('Organizations');
    }

    if (requestResult.status === 'fulfilled') {
      setRequests(requestResult.value.statusCode === 204 ? [] : normalizeAccessRequestList(requestResult.value.resultData));
    } else {
      errors.push('Access Requests');
    }

    if (summaryResult.status === 'fulfilled') {
      const normalized = normalizeDashboardSummary(summaryResult.value.resultData);
      setSummary(normalized);
      if (!normalized) errors.push('Dashboard Summary');
    } else {
      setSummary(null);
      errors.push('Dashboard Summary');
    }

    if (assignmentResult.status === 'fulfilled') {
      const data = assignmentResult.value.resultData;
      setAssignmentSummary(assignmentResult.value.statusCode === 204 || !Array.isArray(data) ? [] : data as ProductAssignmentSummaryApiItem[]);
    } else {
      errors.push('App Access Overview');
    }

    setLoadErrors(errors);
    setLastRefreshedAt(new Date());

    if (errors.length === 4) {
      setStatus('error');
      setAnnouncement('Failed to load the dashboard.');
    } else {
      setStatus('ready');
      setAnnouncement(errors.length > 0 ? `Dashboard loaded with ${errors.length} section(s) unavailable.` : 'Dashboard loaded.');
      if (isRefresh) {
        if (errors.length > 0) showToast(`Refreshed with issues loading: ${errors.join(', ')}.`, 'error');
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

  // Ticks once a minute purely to re-evaluate staleness below — Date.now() must not be called
  // directly during render, so "now" lives in state and is refreshed from an effect instead.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  //#endregion

  const summaryFailed = status !== 'loading' && !summary;
  const isStale = lastRefreshedAt ? now - lastRefreshedAt.getTime() > STALE_DATA_MINUTES * 60_000 : false;

  // KPI values + entitlement-integrity metrics: authoritative, from Dashboard/GetDashboardSummary
  // — never a client-side count of a possibly-incomplete list, and always a current snapshot (the
  // stored procedure ignores date bounds for these two result sets).
  const kpis = summary?.kpis ?? null;
  const integrity = summary?.integrity ?? null;
  const integrityIssuesCount = integrity?.totalIssues ?? 0;
  const platformAlertsCount = kpis ? kpis.expiredLicenses + kpis.suspendedOrganizations + kpis.staleAccessRequests : 0;
  const totalAlertsCount = platformAlertsCount + integrityIssuesCount;

  const alertRows = useMemo<AlertRow[]>(() => {
    if (!integrity || !kpis) return [];
    const rows: AlertRow[] = [
      { key: 'approvedRequestsMissingOrganizationProduct', label: 'Approved requests missing an organization grant', count: integrity.approvedRequestsMissingOrganizationProduct, description: 'The request was approved, but the organization never received an active app assignment for it.', severity: 'error', to: '/admin/requests?status=approved' },
      { key: 'approvedRequestsMissingUserProduct', label: 'Approved requests missing a member grant', count: integrity.approvedRequestsMissingUserProduct, description: "The request was approved, but the requester's own product mapping was never created.", severity: 'error', to: '/admin/requests?status=approved' },
      { key: 'rejectedRequestsWithActiveEntitlements', label: 'Rejected requests with active access', count: integrity.rejectedRequestsWithActiveEntitlements, description: 'The request was rejected, but the requester still has an active mapping to that product.', severity: 'error', to: '/admin/requests?status=rejected' },
      { key: 'inactiveOrganizationsWithActiveProductAssignments', label: 'Inactive organizations with active app access', count: integrity.inactiveOrganizationsWithActiveProductAssignments, description: 'The organization is inactive or suspended, but still carries an active app assignment.', severity: 'error', to: '/admin/organizations?status=inactive' },
      { key: 'activeOrganizationProductsWithoutMembers', label: 'Active app assignments with no members', count: integrity.activeOrganizationProductsWithoutMembers, description: 'An organization has an active app assignment, but no member is mapped to it.', severity: 'warning', to: '/admin/organizations?integrityIssue=activeOrganizationProductsWithoutMembers' },
      { key: 'activeUserProductsWithoutActiveOrganizationProduct', label: 'Member grants with no active org assignment', count: integrity.activeUserProductsWithoutActiveOrganizationProduct, description: "A member has an active product mapping, but their organization's assignment for it isn't active.", severity: 'warning', to: '/admin/organizations?integrityIssue=activeUserProductsWithoutActiveOrganizationProduct' },
      { key: 'duplicateActiveUserProductMappings', label: 'Duplicate member/product mappings', count: integrity.duplicateActiveUserProductMappings, description: 'The same member has more than one active mapping to the same organization and product.', severity: 'warning', to: '/admin/organizations?integrityIssue=duplicateActiveUserProductMappings' },
      { key: 'expiredLicensesWithActiveOrganizationProduct', label: 'Expired licenses still granting access', count: integrity.expiredLicensesWithActiveOrganizationProduct, description: "A license has expired, but the organization's app assignment was never revoked.", severity: 'warning', to: '/admin/organizations?integrityIssue=expiredLicensesWithActiveOrganizationProduct' },
      { key: 'expiredLicenses', label: 'Expired licenses', count: kpis.expiredLicenses, description: 'Licenses past their expiry date — review and renew or revoke access.', severity: 'warning', to: '/admin/organizations?integrityIssue=expiredLicenses' },
      { key: 'suspendedOrganizations', label: 'Suspended organizations', count: kpis.suspendedOrganizations, description: 'Organizations currently suspended from platform access.', severity: 'warning', to: '/admin/organizations?status=suspended' },
      { key: 'staleAccessRequests', label: 'Stale pending requests', count: kpis.staleAccessRequests, description: `Pending for ${STALE_REQUEST_DAYS}+ days without a decision.`, severity: 'warning', to: '/admin/requests?status=pending' },
    ];
    return rows.filter((row) => row.count > 0).sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'error' ? -1 : 1));
  }, [integrity, kpis]);

  const topOrganizations = useMemo(
    () => [...organizations].sort((a, b) => (b.userCount + b.productCount) - (a.userCount + a.productCount)).slice(0, 6),
    [organizations],
  );

  // Requests filtered by the Access Requests section's own local range — never affects the
  // Platform Summary cards, Organization Health, Application Access, or License Health sections.
  const {
    pendingRequests, approvedRequests, rejectedRequests,
    infoRequestedRequests, rangedPendingRequests, oldestPending,
  } = useMemo(() => {
    const pendingRequests = requests.filter((request) => request.status === 'pending');
    const approvedRequests = requests.filter((request) => request.status === 'approved');
    const rejectedRequests = requests.filter((request) => request.status === 'rejected');
    const infoRequestedRequests = requests.filter((request) => request.status === 'info-requested');
    const rangedPendingRequests = pendingRequests.filter((request) => inBounds(request.submittedAt, requestBounds));
    const oldestPending = pendingRequests.reduce<string | null>((oldest, request) => (
      !oldest || request.submittedAt < oldest ? request.submittedAt : oldest
    ), null);

    return {
      pendingRequests, approvedRequests, rejectedRequests,
      infoRequestedRequests, rangedPendingRequests, oldestPending,
    };
  }, [requests, requestBounds]);

  const recentActivity = useMemo<ActivityEntry[]>(() => {
    const trendEvents = summary?.trendEvents ?? [];
    const orgEvents: ActivityEntry[] = organizations
      .filter((org) => org.insertedDate)
      .map((org) => ({
        id: `org-${org.orgId}`, kind: 'organization', message: `${org.orgName} was added as an organization`, at: org.insertedDate,
        to: `/admin/organizations/${org.orgId}`,
      }));
    const requestEvents: ActivityEntry[] = requests
      .filter((request) => request.submittedAt)
      .map((request) => ({
        id: `request-${request.accessRequestId}`, kind: 'request', message: `${request.requesterName} requested ${request.productName} for ${request.organizationName}`, at: request.submittedAt,
        onSelect: () => setSelectedRequestId(request.accessRequestId),
      }));
    const licenseEvents: ActivityEntry[] = trendEvents
      .filter((event) => event.eventType === 'LicenseCreated')
      .map((event, index) => ({
        id: `license-${event.eventDate}-${index}`, kind: 'license',
        message: event.orgName && event.productName
          ? `${event.orgName} was issued a license for ${event.productName}`
          : 'A new license was issued',
        at: event.eventDate,
        to: event.orgId ? `/admin/organizations/${event.orgId}` : undefined,
      }));
    const assignmentEvents: ActivityEntry[] = trendEvents
      .filter((event) => event.eventType === 'OrgProductAssignmentCreated')
      .map((event, index) => ({
        id: `assignment-${event.eventDate}-${index}`, kind: 'assignment',
        message: event.orgName && event.productName
          ? `${event.orgName} was granted access to ${event.productName}`
          : 'An organization was granted access to an app',
        at: event.eventDate,
        to: event.orgId ? `/admin/organizations/${event.orgId}` : undefined,
      }));

    const seen = new Set<string>();
    return [...orgEvents, ...requestEvents, ...licenseEvents, ...assignmentEvents]
      .filter((entry) => inBounds(entry.at, activityBounds))
      .sort((a, b) => b.at.localeCompare(a.at))
      .filter((entry) => {
        const dedupeKey = `${entry.kind}:${entry.message}:${entry.at}`;
        if (seen.has(dedupeKey)) return false;
        seen.add(dedupeKey);
        return true;
      });
  }, [organizations, requests, summary, activityBounds]);

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
  // volume reads as discrete counts rather than a misleadingly continuous trend. Record-driven from
  // the real requests list, scoped by the Access Requests section's own local range only.
  const requestChartData = useMemo(() => {
    const byStatus = (statusValue: RequestStatus) => requests.filter((request) => request.status === statusValue).map((request) => request.submittedAt);
    const pending = bucketCounts(byStatus('pending'), requestBuckets);
    const approved = bucketCounts(byStatus('approved'), requestBuckets);
    const rejected = bucketCounts(byStatus('rejected'), requestBuckets);
    const infoRequested = bucketCounts(byStatus('info-requested'), requestBuckets);
    return requestBuckets.map((bucket, index) => ({
      name: bucket.label, Pending: pending[index], Approved: approved[index], Rejected: rejected[index], 'Info Requested': infoRequested[index],
    }));
  }, [requests, requestBuckets]);
  const requestsInRangeTotal = rangedPendingRequests.length + approvedRequests.filter((r) => inBounds(r.submittedAt, requestBounds)).length
    + rejectedRequests.filter((r) => inBounds(r.submittedAt, requestBounds)).length + infoRequestedRequests.filter((r) => inBounds(r.submittedAt, requestBounds)).length;
  const hasRequestSeriesData = requestsInRangeTotal > 0;

  // Organization Status donut — a current snapshot from the summary (no filter), never the loaded
  // list length (the Organizations Overview table below still uses the real list for per-org rows).
  const orgStatusPieData = [
    { key: 'active', name: 'Active', value: kpis?.activeOrganizations ?? 0, color: CHART_STATUS_COLORS.success, filter: 'active' },
    { key: 'inactive', name: 'InActive', value: kpis?.inactiveOrganizations ?? 0, color: CHART_STATUS_COLORS.neutral, filter: 'inactive' },
    { key: 'suspended', name: 'Suspended', value: kpis?.suspendedOrganizations ?? 0, color: CHART_STATUS_COLORS.danger, filter: 'suspended' },
  ];
  const totalOrgsForDonut = kpis?.totalOrganizations ?? 0;

  // Organizations Created Over Time — a small, optional secondary chart with its own local preset
  // range, built from real OrgCreated trend events (never fabricated, never a line for sparse counts).
  const orgTrendChartData = useMemo(() => {
    const orgCreatedDates = (summary?.trendEvents ?? []).filter((event) => event.eventType === 'OrgCreated').map((event) => event.eventDate);
    const counts = bucketCounts(orgCreatedDates, orgTrendBuckets);
    return orgTrendBuckets.map((bucket, index) => ({ name: bucket.label, Created: counts[index] }));
  }, [summary, orgTrendBuckets]);
  const hasOrgTrendData = orgTrendChartData.some((point) => point.Created > 0);

  const licenseHealthData = kpis ? [{
    name: 'Licenses', Active: kpis.activeLicenses, 'Expiring Soon': kpis.expiringLicenses, Expired: kpis.expiredLicenses, Suspended: kpis.suspendedLicenses,
  }] : [];
  const hasLicenseHealthData = (kpis?.totalLicenses ?? 0) > 0;

  // App Access Overview — ranked by active organization count, using the real per-product
  // organization-assignment counts from lic.OrganizationProduct (never core.Product.IsActive) — a
  // current entitlement snapshot, not a catalog listing, so it carries no date filter.
  const rankedAssignments = useMemo(
    () => [...assignmentSummary].sort((a, b) => b.activeOrgCount - a.activeOrgCount).slice(0, 8),
    [assignmentSummary],
  );
  const hasAssignmentData = assignmentSummary.some((item) => item.totalOrgCount > 0);

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
          <div className="flex flex-wrap items-center gap-3">
            {lastRefreshedAt ? (
              <span id="txtDashboardLastRefreshed" className={`text-xs font-semibold ${isStale ? 'text-[var(--warning)]' : 'text-[var(--text-faint)]'}`}>
                Last refreshed {lastRefreshedAt.toLocaleTimeString()}{isStale ? ' — may be stale' : ''}
              </span>
            ) : null}
            <CommonButton id="ibtnRefreshDashboard" variant="headerSecondary" iconLeft={<RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />} onClick={handleRefresh} disabled={refreshing || status === 'loading'}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </CommonButton>
          </div>
        )}
      />

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
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4" aria-busy="true" aria-label="Loading dashboard">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="admin-skeleton h-[4.5rem] w-full" />)}
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
                Couldn't load: {loadErrors.join(', ')}. Those sections show as unavailable below, not as zero — try refreshing.
              </p>
            </div>
          ) : null}

          {/* ============================================================================= */}
          {/* 1. Platform Summary — always the current snapshot, no date filter.             */}
          {/* ============================================================================= */}
          <SectionHeading id="sectionPlatformSummary" title="Platform Summary" subtitle="Current platform state across organizations, apps, requests, and licenses." />
          {summaryFailed ? (
            <EmptyState icon="⚠️" title="Unable to load platform metrics" description="The dashboard summary didn't respond, so KPI values can't be shown right now — try refreshing." actionLabel="Retry" onAction={() => void loadDashboard(true)} />
          ) : (
            <div className="admin-reveal-stagger grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              <KpiTile
                id="lnkKpiOrganizations"
                icon={Building2} tint="linear-gradient(135deg,#166534,#22C55E)" to="/admin/organizations"
                label="Organizations" value={kpis?.totalOrganizations ?? 0}
                status={`${kpis?.activeOrganizations ?? 0} active · ${kpis?.suspendedOrganizations ?? 0} suspended`}
              />
              <KpiTile
                id="lnkKpiProducts"
                icon={Package} tint="linear-gradient(135deg,#1E3A8A,#3B82F6)" to={PRODUCTS_PATHS.list}
                label="Products" value={kpis?.totalProducts ?? 0}
                status={`${kpis?.activeProducts ?? 0} active · ${kpis?.inactiveProducts ?? 0} inactive · ${kpis?.upcomingProducts ?? 0} upcoming`}
              />
              <KpiTile
                id="lnkKpiPendingAccessRequests"
                icon={Layers} tint="linear-gradient(135deg,#B45309,#F59E0B)" to="/admin/requests?status=pending"
                label="Pending Access Requests" value={kpis?.pendingAccessRequests ?? 0}
                status={(kpis?.pendingAccessRequests ?? 0) > 0 ? `${kpis?.pendingAccessRequests} require review` : 'Nothing pending'}
              />
              <KpiTile
                id="lnkKpiLicenses"
                icon={KeyRound} tint="linear-gradient(135deg,#0F766E,#34D399)" to="/admin/organizations"
                label="Licenses" value={kpis?.activeLicenses ?? 0}
                status={(kpis?.expiringLicenses ?? 0) > 0 || (kpis?.expiredLicenses ?? 0) > 0
                  ? `${kpis?.expiringLicenses ?? 0} expiring soon · ${kpis?.expiredLicenses ?? 0} expired`
                  : 'None expiring or expired'}
              />
            </div>
          )}

          {/* ============================================================================= */}
          {/* 2. Priority Alerts                                                             */}
          {/* ============================================================================= */}
          <section id="sectionPriorityAlerts" className="admin-panel-card scroll-mt-4">
            <div className="admin-panel-card__header">
              <div>
                <h2 className="panel-title">Priority Alerts</h2>
                <p className="panel-subtitle">Entitlement-integrity and platform conditions that need attention, computed live — not a snapshot.</p>
              </div>
            </div>
            {loadErrors.length > 0 || summaryFailed ? (
              <div className="mx-4 mb-2 flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-panel)] border border-[var(--error)] bg-[var(--error-bg)] px-4 py-2.5">
                <span className="flex items-center gap-2 text-xs font-bold text-[var(--error)]">
                  <AlertTriangle size={15} className="shrink-0" aria-hidden="true" />
                  Platform health can't be fully verified — {loadErrors.length > 0 ? loadErrors.join(', ') : 'the dashboard summary'} didn't load.
                </span>
                <CommonButton id="btnRetryPriorityAlerts" variant="outline" size="sm" onClick={() => void loadDashboard(true)}>Retry</CommonButton>
              </div>
            ) : isStale ? (
              <div className="mx-4 mb-2 flex items-center gap-2 rounded-[var(--radius-panel)] border border-[var(--warning)] bg-[var(--warning-bg)] px-4 py-2.5 text-xs font-bold text-[var(--warning)]">
                <Clock size={15} className="shrink-0" aria-hidden="true" />
                This data is more than {STALE_DATA_MINUTES} minutes old — refresh to confirm it still holds.
              </div>
            ) : null}
            {summaryFailed ? (
              <EmptyState icon="⚠️" title="Unable to verify platform health" description="The dashboard summary didn't respond, so alerts can't be shown right now." actionLabel="Retry" onAction={() => void loadDashboard(true)} />
            ) : totalAlertsCount === 0 ? (
              <EmptyState icon="🟢" title="All systems normal" description="Every data source responded and no entitlement or platform alerts are open right now." />
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--line-soft)]">
                {alertRows.map((row) => {
                  const rowIdSuffix = row.key.charAt(0).toUpperCase() + row.key.slice(1);
                  return (
                    <li key={row.key} id={`rowAlert${rowIdSuffix}`} className="flex items-center gap-2.5 px-4 py-3">
                      <span className={`grid size-8 shrink-0 place-items-center rounded-full ${row.severity === 'error' ? 'bg-[var(--error-bg)] text-[var(--error)]' : 'bg-[var(--warning-bg)] text-[var(--warning)]'}`} aria-hidden="true">
                        <ShieldAlert size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{row.label}</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">{row.description}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold ${row.severity === 'error' ? 'bg-[var(--error-bg)] text-[var(--error)]' : 'bg-[var(--warning-bg)] text-[var(--warning)]'}`}>{row.count}</span>
                      <Link id={`lnkReviewAlert${rowIdSuffix}`} to={row.to} className="shrink-0 text-xs font-bold text-[var(--primary)] hover:underline">Review</Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ============================================================================= */}
          {/* 3. Access Requests — the only section this local filter affects.               */}
          {/* ============================================================================= */}
          <SectionHeading
            id="sectionAccessRequests"
            title="Access Requests"
            subtitle="Pending requests and approval activity"
            right={(
              <>
                <RangeFilterControl
                  filterId="AccessRequests" idPrefix="Access requests" value={requestRange} onChange={setRequestRange} options={REQUEST_RANGE_OPTIONS}
                  customFrom={requestCustomFrom} customTo={requestCustomTo}
                  onCustomFromChange={setRequestCustomFrom} onCustomToChange={setRequestCustomTo}
                  error={requestRangeError}
                />
                <Link id="lnkViewAllAccessRequests" to="/admin/requests" className="text-xs font-bold text-[var(--primary)] hover:underline">View all</Link>
              </>
            )}
          />
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section id="sectionRequestsTrend" className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Requests Trend</h2>
                  <p className="panel-subtitle">{RANGE_LABELS[requestRange]} · {requestsInRangeTotal} request{requestsInRangeTotal === 1 ? '' : 's'} total</p>
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
                    <ResponsiveContainer id="chartRequestTrend" width="100%" height={CHART_HEIGHT}>
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

            <section id="sectionPendingApprovals" className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Pending Approvals</h2>
                  <p className="panel-subtitle">{RANGE_LABELS[requestRange]}{oldestPending ? ` · Oldest: ${formatRelativeDate(oldestPending)}` : ''}</p>
                </div>
              </div>
              {pendingRequests.length === 0 ? (
                <EmptyState icon="✅" title="Nothing pending" description="New access requests will show up here as they arrive." />
              ) : rangedPendingRequests.length === 0 ? (
                <EmptyState icon="🗓️" title="No requests in this range" description={`No pending requests were submitted in the ${RANGE_LABELS[requestRange].toLowerCase()}. Try widening the date range.`} />
              ) : (
                <ul id="tblPendingApprovals" className="divide-y divide-[var(--line-soft)]">
                  {rangedPendingRequests.slice(0, 5).map((request) => {
                    const isStaleRequest = daysSince(request.submittedAt) >= STALE_REQUEST_DAYS;
                    return (
                      <li key={request.accessRequestId} id={`rowAccessRequest${request.accessRequestId}`} className="flex items-center gap-2.5 px-4 py-3">
                        <button
                          id={`btnViewAccessRequest${request.accessRequestId}`}
                          type="button"
                          onClick={() => setSelectedRequestId(request.accessRequestId)}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                        >
                          <EntityAvatar name={request.requesterName} size={28} />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="block truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{request.requesterName}</span>
                              {isStaleRequest ? <span className="shrink-0 rounded-full bg-[var(--warning-bg)] px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-[var(--warning)]">Stale</span> : null}
                            </span>
                            <span className="block truncate text-xs text-[var(--text-muted)]">{request.organizationName} · {request.productName}</span>
                            <span className="block truncate text-[0.6875rem] font-semibold text-[var(--text-faint)]">Requested {formatRelativeDate(request.submittedAt)}</span>
                          </span>
                        </button>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <CommonIconButton
                            id={`ibtnApproveAccessRequest${request.accessRequestId}`}
                            aria-label={`Approve ${request.requesterName}'s request`}
                            icon={<Check size={15} />}
                            onClick={() => void handleQuickAction(request, 'approved')}
                            disabled={actingRequestId === request.accessRequestId}
                          />
                          <CommonIconButton
                            id={`ibtnViewAccessRequest${request.accessRequestId}`}
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

          {/* ============================================================================= */}
          {/* 4. Organization Health — current snapshot, no filter by default; the secondary  */}
          {/*    "Created over time" chart carries its own small local filter.                */}
          {/* ============================================================================= */}
          <SectionHeading id="sectionOrganizationHealth" title="Organization Health" subtitle="Current organization status across the platform" right={<Link id="lnkViewAllOrganizations" to="/admin/organizations" className="text-xs font-bold text-[var(--primary)] hover:underline">View all</Link>} />
          <div className="grid gap-4 lg:grid-cols-2">
            <section id="sectionOrganizationStatus" className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Organization Status</h2>
                  <p className="panel-subtitle">Click a segment or legend row to filter the organization list.</p>
                </div>
              </div>
              {totalOrgsForDonut === 0 ? (
                <EmptyState icon="🏢" title="No organizations yet" description="Organizations added to the platform will appear here." />
              ) : (
                <div className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
                  <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
                    <ResponsiveContainer id="chartOrganizationStatus" width={160} height={160}>
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
                        <span className="block text-xl font-extrabold leading-none text-[var(--text-primary)]">{totalOrgsForDonut}</span>
                        <span className="mt-0.5 block text-[0.5625rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Total</span>
                      </div>
                    </div>
                    <span className="sr-only">
                      {totalOrgsForDonut} organizations total: {orgStatusPieData.map((segment) => `${segment.name} ${segment.value}`).join(', ')}
                    </span>
                  </div>
                  <ul className="flex w-full max-w-[14rem] flex-col gap-1.5">
                    {orgStatusPieData.map((segment) => (
                      <li key={segment.key}>
                        <button
                          id={`filterOrganizationStatus${segment.name}`}
                          type="button"
                          onClick={() => navigate(`/admin/organizations?status=${segment.filter}`)}
                          className="flex w-full items-center justify-between gap-2 rounded-[var(--admin-control-radius)] px-2 py-1.5 text-left text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover)]"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="size-2 shrink-0 rounded-full" style={{ background: segment.color }} aria-hidden="true" />
                            {segment.name}
                          </span>
                          <span className="font-bold text-[var(--text-primary)]">
                            {segment.value} · {totalOrgsForDonut === 0 ? 0 : Math.round((segment.value / totalOrgsForDonut) * 100)}%
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section id="sectionOrganizationsCreatedOverTime" className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Organizations Created Over Time</h2>
                  <p className="panel-subtitle">Real creation events — {RANGE_LABELS[orgTrendRange].toLowerCase()}</p>
                </div>
                <div className="w-32 shrink-0">
                  <Dropdown
                    id="ddlOrganizationsCreatedDateRange"
                    label="Organizations created — date range" hideLabel searchable={false} clearable={false}
                    value={orgTrendRange}
                    onValueChange={(value) => setOrgTrendRange((value as DateRange) ?? '30d')}
                    options={ORG_TREND_RANGE_OPTIONS.map((option) => ({ id: option, value: RANGE_LABELS[option] }))}
                    className="min-h-8"
                  />
                </div>
              </div>
              {!hasOrgTrendData ? (
                <EmptyState icon="🗓️" title="No organizations created in this range" description="Try widening the date range." />
              ) : (
                <ResponsiveContainer id="chartOrganizationsCreatedOverTime" width="100%" height={CHART_HEIGHT}>
                  <BarChart data={orgTrendChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                    <XAxis dataKey="name" tick={CHART_AXIS_TICK} axisLine={{ stroke: CHART_GRID_STROKE }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} width={28} />
                    <RechartsTooltip content={ChartTooltip} cursor={{ fill: 'var(--hover)' }} />
                    <Bar dataKey="Created" fill={CHART_STATUS_COLORS.primary} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>
          </div>

          <section id="sectionOrganizationsOverview" className="admin-panel-card">
            <div className="admin-panel-card__header">
              <div>
                <h2 className="panel-title">{topOrganizations.length > 0 ? `Top ${topOrganizations.length} Organization${topOrganizations.length === 1 ? '' : 's'}` : 'Top Organizations'}</h2>
                <p className="panel-subtitle">Your most active organizations, ranked by linked users and assigned apps.</p>
              </div>
            </div>
            {topOrganizations.length === 0 ? (
              <EmptyState icon="🏢" title="No organizations yet" description="Organizations added to the platform will appear here." />
            ) : (
              <div className="overflow-x-auto">
                <table id="tblOrganizationsOverview" className="admin-table">
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
                      <tr key={org.orgId} id={`rowOrganization${org.orgId}`} className="cursor-pointer" onClick={() => navigate(`/admin/organizations/${org.orgId}`)}>
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

          {/* ============================================================================= */}
          {/* 5. Application Access — current entitlement snapshot, no filter.                */}
          {/* ============================================================================= */}
          <SectionHeading
            id="sectionApplicationAccess"
            title={rankedAssignments.length > 0 ? `Top ${rankedAssignments.length} Application${rankedAssignments.length === 1 ? '' : 's'}` : 'Top Applications'}
            subtitle="Your most-used apps, ranked by how many organizations currently have active access"
            right={<Link id="lnkViewAllApplicationAccess" to={PRODUCTS_PATHS.list} className="text-xs font-bold text-[var(--primary)] hover:underline">View all</Link>}
          />
          <section className="admin-panel-card">
            {!hasAssignmentData ? (
              <EmptyState icon="📦" title="No app assignments yet" description="Organization-to-app assignments will appear here once products are assigned." />
            ) : (
              <div className="overflow-x-auto">
                <table id="tblApplicationAccess" className="admin-table">
                  <caption className="sr-only">Products ranked by active organization assignments</caption>
                  <thead>
                    <tr>
                      <th scope="col">Product</th>
                      <th scope="col">Active Orgs</th>
                      <th scope="col">InActive/Revoked</th>
                      <th scope="col">Total Ever Assigned</th>
                      <th scope="col">% Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedAssignments.map((item) => (
                      <tr key={item.productId} id={`rowProduct${item.productId}`} className="cursor-pointer" onClick={() => navigate(PRODUCTS_PATHS.details, { state: { productId: item.productId } })}>
                        <td className="font-bold text-[var(--text-primary)]">{item.productName}</td>
                        <td className="text-[var(--success)]">{item.activeOrgCount}</td>
                        <td className="text-[var(--text-secondary)]">{item.inactiveOrgCount}</td>
                        <td className="text-[var(--text-secondary)]">{item.totalOrgCount}</td>
                        <td className="text-[var(--text-secondary)]">{item.totalOrgCount === 0 ? '—' : `${Math.round((item.activeOrgCount / item.totalOrgCount) * 100)}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ============================================================================= */}
          {/* 6. License Health — current status snapshot, no filter (no reliable license     */}
          {/*    date-series exists beyond the license-issued events already shown in the      */}
          {/*    Recent Activity feed below).                                                  */}
          {/* ============================================================================= */}
          <SectionHeading id="sectionLicenseHealth" title="License Health" subtitle="Current license status across all organizations" right={<Link id="lnkViewAllLicenses" to="/admin/organizations" className="text-xs font-bold text-[var(--primary)] hover:underline">View all</Link>} />
          <section className="admin-panel-card">
            {!hasLicenseHealthData ? (
              <EmptyState icon="🔑" title="No licenses yet" description="Licenses issued to organizations will appear here." />
            ) : (
              <div className="flex flex-col gap-2 p-4">
                <ResponsiveContainer id="chartLicenseHealth" width="100%" height={70}>
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
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatChip label="Active" value={kpis?.activeLicenses ?? 0} tone="success" />
                  <StatChip label="Expiring soon" value={kpis?.expiringLicenses ?? 0} tone="warning" />
                  <StatChip label="Expired" value={kpis?.expiredLicenses ?? 0} tone="danger" />
                  <StatChip label="Suspended" value={kpis?.suspendedLicenses ?? 0} tone="neutral" />
                </ul>
                {(kpis?.expiringLicenses ?? 0) > 0 || (kpis?.expiredLicenses ?? 0) > 0 ? (
                  <button
                    id="btnReviewLicenseHealth"
                    type="button"
                    onClick={() => navigate('/admin/organizations')}
                    className="flex items-center gap-1.5 text-left text-[0.6875rem] font-bold text-[var(--warning)] hover:underline"
                  >
                    <AlertTriangle size={12} className="shrink-0" aria-hidden="true" />
                    {kpis?.expiringLicenses ?? 0} expiring soon and {kpis?.expiredLicenses ?? 0} already expired — review from the organization's Licenses tab.
                  </button>
                ) : null}
              </div>
            )}
          </section>

          {/* ============================================================================= */}
          {/* 7. Recent Activity — this section's own local filter only.                      */}
          {/* ============================================================================= */}
          <SectionHeading
            id="sectionRecentActivity"
            title="Recent Activity"
            subtitle="New organizations, requests, licenses, and app assignments"
            right={(
              <RangeFilterControl
                filterId="RecentActivity" idPrefix="Recent activity" value={activityRange} onChange={setActivityRange} options={ACTIVITY_RANGE_OPTIONS}
                customFrom={activityCustomFrom} customTo={activityCustomTo}
                onCustomFromChange={setActivityCustomFrom} onCustomToChange={setActivityCustomTo}
                error={activityRangeError}
              />
            )}
          />
          <section className="admin-panel-card">
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
                        const iconSpan = (
                          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)]" aria-hidden="true">
                            <Icon size={12} />
                          </span>
                        );
                        const body = (
                          <div className="min-w-0">
                            <p className="text-[var(--text-primary)]">{item.message}</p>
                            <p className="text-xs text-[var(--text-muted)]">{formatRelativeDate(item.at)}</p>
                          </div>
                        );
                        if (item.to) {
                          return (
                            <li key={item.id}>
                              <Link id={`lnkActivity${item.id}`} to={item.to} className="flex items-start gap-2.5 rounded-[var(--radius-control)] p-1 -m-1 text-[0.8125rem] hover:bg-[var(--hover)]">
                                {iconSpan}
                                {body}
                              </Link>
                            </li>
                          );
                        }
                        if (item.onSelect) {
                          return (
                            <li key={item.id}>
                              <button id={`btnActivity${item.id}`} type="button" onClick={item.onSelect} className="flex w-full items-start gap-2.5 rounded-[var(--radius-control)] p-1 -m-1 text-left text-[0.8125rem] hover:bg-[var(--hover)]">
                                {iconSpan}
                                {body}
                              </button>
                            </li>
                          );
                        }
                        return (
                          <li key={item.id} className="flex items-start gap-2.5 text-[0.8125rem]">
                            {iconSpan}
                            {body}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          <p className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-faint)]">
            <Activity size={12} className="shrink-0" aria-hidden="true" />
            CFR Acutis Admin Dashboard{lastRefreshedAt ? ` · Data last refreshed ${lastRefreshedAt.toLocaleTimeString()}` : ''}
            {status === 'ready' && (kpis?.expiringLicenses ?? 0) > 0 ? (
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-[var(--success)]" /> {kpis?.expiringLicenses} license{kpis?.expiringLicenses === 1 ? '' : 's'} expiring soon</span>
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
