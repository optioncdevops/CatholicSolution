import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, Building2, Check, CheckCircle2, ChevronRight, Clock, KeyRound,
  Layers, Package, RefreshCw, ShieldAlert, Users, X,
} from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { EntityAvatar } from '@app/components/EntityAvatar';
import { Dropdown } from '@app/components/formControls';
import { getAllLicenses, getOrganizations } from './organizations/services/organizationsService';
import { normalizeOrganizationsList } from './organizations/utils/organizationHelpers';
import type { LicenseSummaryApiItem, OrganizationApiItem } from './organizations/types/organizationTypes';
import { getUsers, normalizeUsersList } from './users';
import type { UsersApiItem } from './users';
import { getProducts, normalizeProductList } from './Products';
import type { ProductApiItem } from './Products';
import { getAccessRequests, normalizeAccessRequestList, updateAccessRequestStatus } from './requests';
import type { AccessRequestApiItem } from './requests';
import RequestReviewModal from './requests/pages/partials/RequestReviewModal';
import { accessStatusOf, daysSince, formatRelativeDate } from './utils/formatDate';
import { formatDate, formatRelativeDate, daysSince } from './utils/formatDate';
import { getProductWarnings, PRODUCTS_PATHS } from './products';
import type { AdminApplication } from './types';

type DashboardStatus = 'loading' | 'ready' | 'error';
type DateRange = '7d' | '30d' | '90d' | 'all';
type LicenseDisplayStatus = 'active' | 'suspended' | 'expiring-soon' | 'expired';
type ActivityKind = 'organization' | 'product' | 'request';

interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  message: string;
  at: string;
}

const RANGE_LABELS: Record<DateRange, string> = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', all: 'All Time' };
const RANGE_DAYS: Partial<Record<DateRange, number>> = { '7d': 7, '30d': 30, '90d': 90 };
const STALE_REQUEST_DAYS = 7;

function withinRange(dateStr: string, range: DateRange): boolean {
  const limit = RANGE_DAYS[range];
  if (limit === undefined) return true;
  return daysSince(dateStr) <= limit;
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

const ACTIVITY_ICON: Record<ActivityKind, typeof Package> = {
  organization: Building2, product: Package, request: Layers,
};

function KpiTile({ icon: Icon, tint, label, value, status, to }: {
  icon: typeof Package; tint: string; label: string; value: number; status: string; to: string;
}) {
  return (
    <Link to={to} className="admin-kpi-tile">
      <span className="admin-kpi-tile__icon" style={{ background: tint }} aria-hidden="true"><Icon size={18} /></span>
      <span className="min-w-0">
        <span className="metric-label block text-[var(--text-faint)]">{label}</span>
        <span className="metric-value block leading-tight">{value}</span>
        <span className="block truncate text-[0.6875rem] font-semibold text-[var(--text-muted)]">{status}</span>
      </span>
    </Link>
  );
}

function AlertsKpiTile({ value, status }: { value: number; status: string }) {
  return (
    <button
      type="button"
      onClick={() => document.getElementById('dashboard-alerts')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      className="admin-kpi-tile text-left"
    >
      <span className="admin-kpi-tile__icon" style={{ background: 'linear-gradient(135deg,#991B1B,#EF4444)' }} aria-hidden="true"><ShieldAlert size={18} /></span>
      <span className="min-w-0">
        <span className="metric-label block text-[var(--text-faint)]">Alerts / Issues</span>
        <span className="metric-value block leading-tight">{value}</span>
        <span className="block truncate text-[0.6875rem] font-semibold text-[var(--text-muted)]">{status}</span>
      </span>
    </button>
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

function CategoryBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((count / max) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--text-secondary)]">{label}</span>
        <span className="font-bold text-[var(--text-primary)]">{count}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]" role="presentation">
        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${pct}%` }} />
      </div>
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

export function DashboardPage() {
  //#region Hooks
  const { showToast } = useToast();
  const navigate = useNavigate();
  //#endregion

  //#region States
  const [status, setStatus] = useState<DashboardStatus>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<DateRange>('30d');
  const [announcement, setAnnouncement] = useState('');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);

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
  // dashboard — the right resilience trade-off when a single page aggregates five domains.
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

  const activeOrgs = organizations.filter((org) => org.orgStatus === 'active');
  const inactiveOrgs = organizations.filter((org) => org.orgStatus === 'inactive');
  const suspendedOrgs = organizations.filter((org) => org.orgStatus === 'suspended');

  const activeUsers = users.filter((user) => user.isActive === 1 && user.isLocked !== 1);
  const activeProducts = products.filter((product) => product.isActive);

  const pendingRequests = requests.filter((request) => request.status === 'pending');
  const approvedRequests = requests.filter((request) => request.status === 'approved');
  const rejectedRequests = requests.filter((request) => request.status === 'rejected');
  const infoRequestedRequests = requests.filter((request) => request.status === 'info-requested');
  const rangedPendingRequests = pendingRequests.filter((request) => withinRange(request.submittedAt, range));
  const oldestPending = pendingRequests.reduce<string | null>((oldest, request) => (
    !oldest || request.submittedAt < oldest ? request.submittedAt : oldest
  ), null);
  const staleRequests = pendingRequests.filter((request) => daysSince(request.submittedAt) >= STALE_REQUEST_DAYS);

  const expiredLicenses = licenses.filter((license) => licenseDisplayStatus(license) === 'expired');
  const expiringLicenses = licenses.filter((license) => licenseDisplayStatus(license) === 'expiring-soon');

  const alertsCount = expiredLicenses.length + suspendedOrgs.length + staleRequests.length;

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

    return [...orgEvents, ...productEvents, ...requestEvents]
      .filter((entry) => withinRange(entry.at, range))
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [organizations, products, requests, range]);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const key = product.subCategoryName?.trim() || 'Uncategorized';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [products]);
  const maxCategoryCount = categoryBreakdown.reduce((max, [, count]) => Math.max(max, count), 0);

  //#region Handlers
  const handleRefresh = () => { void loadDashboard(true); };

  const handleQuickAction = async (request: AccessRequestApiItem, nextStatus: 'approved' | 'rejected') => {
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
            <CommonButton variant="headerSecondary" iconLeft={<RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />} onClick={handleRefresh} disabled={refreshing || status === 'loading'}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </CommonButton>
            <CommonButton variant="headerSecondary" iconLeft={<Building2 size={14} />} onClick={() => navigate('/admin/organizations/add')}>Add Organization</CommonButton>
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
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6" aria-busy="true" aria-label="Loading dashboard">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="admin-skeleton h-[4.5rem] w-full" />)}
          </div>
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="admin-panel-card"><SectionSkeleton rows={6} /></section>
            <section className="admin-panel-card"><SectionSkeleton rows={4} /></section>
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
          <div className="admin-reveal-stagger grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
            <KpiTile
              icon={Building2} tint="linear-gradient(135deg,#166534,#22C55E)" to="/admin/organizations"
              label="Organizations" value={organizations.length}
              status={`${activeOrgs.length} active · ${suspendedOrgs.length} suspended`}
            />
            <KpiTile
              icon={Users} tint="linear-gradient(135deg,#5B21B6,#8B5CF6)" to="/admin/users"
              label="Active Users" value={activeUsers.length}
              status={`of ${users.length} total users`}
            />
            <KpiTile
              icon={Package} tint="linear-gradient(135deg,#1E3A8A,#3B82F6)" to="/admin/applications"
              label="Active Apps" value={activeProducts.length}
              status={`of ${products.length} in catalog`}
            />
            <KpiTile
              icon={Layers} tint="linear-gradient(135deg,#B45309,#F59E0B)" to="/admin/requests"
              label="Pending Requests" value={pendingRequests.length}
              status={oldestPending ? `Oldest: ${formatRelativeDate(oldestPending)}` : 'Nothing pending'}
            />
            <KpiTile
              icon={KeyRound} tint="linear-gradient(135deg,#0F766E,#34D399)" to="/admin/organizations"
              label="Licenses" value={licenses.length}
              status={`${expiringLicenses.length} expiring · ${expiredLicenses.length} expired`}
            />
            <AlertsKpiTile
              value={alertsCount}
              status={alertsCount > 0 ? `${expiredLicenses.length} expired · ${suspendedOrgs.length} suspended · ${staleRequests.length} stale` : 'Nothing needs attention'}
            />
          </div>

          {/* Priority overview strip */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
            <StatChip label="Active Orgs" value={activeOrgs.length} tone="success" />
            <StatChip label="Inactive Orgs" value={inactiveOrgs.length} tone="neutral" />
            <StatChip label="Suspended Orgs" value={suspendedOrgs.length} tone="danger" />
            <StatChip label="Pending" value={pendingRequests.length} tone="warning" />
            <StatChip label="Approved" value={approvedRequests.length} tone="success" />
            <StatChip label="Rejected" value={rejectedRequests.length} tone="danger" />
            <StatChip label="Info Requested" value={infoRequestedRequests.length} tone="info" />
          </div>

          {/* Main content: operational overview + requests/approvals */}
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
                  <p className="panel-subtitle">Pending · {RANGE_LABELS[range].toLowerCase()}</p>
                </div>
                <Link to="/admin/requests" className="text-xs font-bold text-[var(--primary)] hover:underline">View All</Link>
              </div>
              {pendingRequests.length === 0 ? (
                <EmptyState icon="✅" title="Nothing pending" description="New access requests will show up here as they arrive." />
              ) : rangedPendingRequests.length === 0 ? (
                <EmptyState icon="🗓️" title="No requests in this range" description={`No pending requests were submitted in the ${RANGE_LABELS[range].toLowerCase()}. Try widening the date range.`} />
              ) : (
                <ul className="divide-y divide-[var(--line-soft)]">
                  {rangedPendingRequests.slice(0, 5).map((request) => (
                    <li key={request.accessRequestId} className="flex items-center gap-2.5 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRequestId(request.accessRequestId)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                      >
                        <EntityAvatar name={request.requesterName} size={28} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{request.requesterName}</span>
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
                          aria-label={`Reject ${request.requesterName}'s request`}
                          variant="danger"
                          icon={<X size={15} />}
                          onClick={() => void handleQuickAction(request, 'rejected')}
                          disabled={actingRequestId === request.accessRequestId}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Recent activity + application/app access overview */}
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Recent Activity</h2>
                  <p className="panel-subtitle">{RANGE_LABELS[range]} · new organizations, product updates, and access requests</p>
                </div>
              </div>
              {recentActivity.length === 0 ? (
                <EmptyState icon="🕒" title="No activity in this range" description="Try widening the date range to see older activity." />
              ) : (
                <ul className="flex flex-col gap-3 p-4">
                  {recentActivity.slice(0, 8).map((item) => {
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
              )}
            </section>

            <section className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">App Access Overview</h2>
                  <p className="panel-subtitle">Catalog by category</p>
                </div>
              </div>
              {categoryBreakdown.length === 0 ? (
                <EmptyState icon="📦" title="No products yet" description="Products added to the catalog will appear here." />
              ) : (
                <div className="flex flex-col gap-3 p-4">
                  {categoryBreakdown.map(([category, count]) => (
                    <CategoryBar key={category} label={category} count={count} max={maxCategoryCount} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Alerts / system health + quick actions */}
          <div id="dashboard-alerts" className="grid scroll-mt-4 gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Alerts &amp; Attention Needed</h2>
                  <p className="panel-subtitle">Computed live from license expiry, organization status, and request age — this platform has no separate system-health/queue telemetry today.</p>
                </div>
              </div>
              {alertsCount === 0 ? (
                <EmptyState icon="🟢" title="All clear" description="No expired licenses, suspended organizations, or stale requests right now." />
              ) : (
                <ul className="flex flex-col divide-y divide-[var(--line-soft)]">
                  {expiredLicenses.slice(0, 3).map((license) => (
                    <li key={`license-${license.licenseId}`} className="flex items-center gap-2.5 px-4 py-2.5 text-[0.8125rem]">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--error-bg)] text-[var(--error)]" aria-hidden="true"><KeyRound size={13} /></span>
                      <span className="min-w-0 flex-1 truncate text-[var(--text-primary)]">{license.productName} license for {license.orgName} expired</span>
                      <StatusBadge status="expired" kind="license" />
                    </li>
                  ))}
                  {suspendedOrgs.slice(0, 3).map((org) => (
                    <li key={`org-${org.orgId}`} className="flex items-center gap-2.5 px-4 py-2.5 text-[0.8125rem]">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--error-bg)] text-[var(--error)]" aria-hidden="true"><Building2 size={13} /></span>
                      <span className="min-w-0 flex-1 truncate text-[var(--text-primary)]">{org.orgName} is suspended</span>
                      <StatusBadge status="suspended" kind="organization" />
                    </li>
                  ))}
                  {staleRequests.slice(0, 3).map((request) => (
                    <li key={`request-${request.accessRequestId}`} className="flex items-center gap-2.5 px-4 py-2.5 text-[0.8125rem]">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--warning-bg)] text-[var(--warning)]" aria-hidden="true"><Clock size={13} /></span>
                      <span className="min-w-0 flex-1 truncate text-[var(--text-primary)]">{request.requesterName}'s request has waited {daysSince(request.submittedAt)} days</span>
                      <StatusBadge status="pending" kind="request" />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="admin-panel-card">
              <div className="admin-panel-card__header"><h2 className="panel-title">Quick Actions</h2></div>
              <ul className="flex flex-col gap-2 p-3">
                {[
                  { to: '/admin/requests', label: 'Review Access Requests', icon: Layers, tint: 'linear-gradient(135deg,#B45309,#F59E0B)' },
                  { to: '/admin/applications', label: 'Manage Products', icon: Package, tint: 'linear-gradient(135deg,#1E3A8A,#3B82F6)' },
                  { to: '/admin/organizations', label: 'Manage Organizations', icon: Building2, tint: 'linear-gradient(135deg,#166534,#22C55E)' },
                  { to: '/admin/users', label: 'Manage Users', icon: Users, tint: 'linear-gradient(135deg,#5B21B6,#8B5CF6)' },
                ].map(({ to, label, icon: Icon, tint }) => (
                  <li key={to}>
                    <Link to={to} className="admin-quick-action">
                      <span className="admin-quick-action__icon" style={{ background: tint }} aria-hidden="true"><Icon size={14} /></span>
                      <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{label}</span>
                      <ChevronRight size={14} className="shrink-0 text-[var(--text-faint)]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
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
