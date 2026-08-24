import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Building2, Check, CheckCircle2, ChevronRight, ClipboardList, Package,
  RefreshCw, Settings, Users, X,
} from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { useAdminData } from './AdminDataContext';
import { StatusBadge } from '@app/components/Badge';
import { EntityAvatar } from '@app/components/EntityAvatar';
import { Dropdown } from '@app/components/formControls';
import { formatDate, formatRelativeDate, daysSince } from './utils/formatDate';
import { getProductWarnings } from './applications/productValidation';
import type { AdminApplication } from './types';

type DashboardStatus = 'loading' | 'ready' | 'error';
type DateRange = '7d' | '30d' | '90d' | 'all';

const RANGE_LABELS: Record<DateRange, string> = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', all: 'All time' };
const RANGE_DAYS: Partial<Record<DateRange, number>> = { '7d': 7, '30d': 30, '90d': 90 };

function withinRange(dateStr: string, range: DateRange): boolean {
  const limit = RANGE_DAYS[range];
  if (limit === undefined) return true;
  return daysSince(dateStr) <= limit;
}

function domainOf(url: string): string {
  if (!url.trim()) return '—';
  try {
    return new URL(url).hostname;
  } catch {
    return '—';
  }
}

const QUICK_ACTIONS = [
  { to: '/admin/requests', label: 'Review access requests', icon: ClipboardList },
  { to: '/admin/applications', label: 'Manage products', icon: Package },
  { to: '/admin/organizations', label: 'Manage organizations', icon: Building2 },
  { to: '/admin/users', label: 'Manage users', icon: Users },
  { to: '/admin/settings', label: 'Open settings', icon: Settings },
] as const;

const ACTIVITY_ICON: Record<string, typeof Package> = {
  application: Package, organization: Building2, user: Users, request: ClipboardList,
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

function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 p-4" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => <div key={index} className="admin-skeleton h-9 w-full" />)}
    </div>
  );
}

export function DashboardPage() {
  const { applications, organizations, users, requests, activity, getOrganization, getApplication, resolveRequest } = useAdminData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [status, setStatus] = useState<DashboardStatus>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<DateRange>('30d');
  const [announcement, setAnnouncement] = useState('');
  const refreshCountRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setStatus('ready'), 450);
    return () => clearTimeout(timer);
  }, []);

  const loadDashboard = (isRetry: boolean) => {
    setStatus('loading');
    setAnnouncement(isRetry ? 'Retrying…' : 'Loading dashboard…');
    setTimeout(() => {
      setStatus('ready');
      setAnnouncement('Dashboard loaded.');
    }, 450);
  };

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setAnnouncement('Refreshing dashboard…');
    setTimeout(() => {
      refreshCountRef.current += 1;
      // Simulates an occasional failed refresh so the error state is a real, reachable path
      // in this prototype rather than dead code — fails every 3rd click.
      const shouldFail = refreshCountRef.current % 3 === 0;
      setRefreshing(false);
      if (shouldFail) {
        setStatus('error');
        setAnnouncement('Failed to refresh the dashboard.');
        showToast('Could not refresh the dashboard (simulated connection issue) ✗');
      } else {
        setAnnouncement('Dashboard refreshed.');
        showToast('Dashboard refreshed ✓');
      }
    }, 700);
  };

  const pendingRequests = requests.filter((request) => request.status === 'pending');
  const rangedPendingRequests = pendingRequests.filter((request) => withinRange(request.submittedAt, range));
  const rangedActivity = activity.filter((item) => withinRange(item.at, range));
  const oldestPending = pendingRequests.reduce<string | null>((oldest, request) => (
    !oldest || request.submittedAt < oldest ? request.submittedAt : oldest
  ), null);

  const activeProducts = applications.filter((app) => app.status === 'active');
  const productsNeedingAttention = applications.filter((app) => getProductWarnings(app, applications).length > 0);
  const activeOrgs = organizations.filter((org) => org.status === 'active');
  const trialOrgs = organizations.filter((org) => org.status === 'trial');
  const activeUsers = users.filter((user) => user.status === 'active');
  const invitedUsers = users.filter((user) => user.status === 'invited');

  const productHealthRows = [...applications].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  const handleApprove = (requestId: string, requesterName: string) => {
    resolveRequest(requestId, 'approved');
    showToast(`Approved ${requesterName}'s request ✓`);
  };
  const handleReject = (requestId: string, requesterName: string) => {
    resolveRequest(requestId, 'rejected');
    showToast(`Rejected ${requesterName}'s request`);
  };

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
            <CommonButton variant="outline" iconLeft={<RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />} onClick={handleRefresh} disabled={refreshing || status === 'loading'}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </CommonButton>
            <CommonButton variant="primary" iconLeft={<Package size={14} />} onClick={() => navigate('/admin/applications')}>Manage products</CommonButton>
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
          title="Couldn't refresh the dashboard"
          description="Something went wrong loading the latest platform data. This is a simulated error state — this prototype has no real API to fail."
          actionLabel="Retry"
          onAction={() => loadDashboard(true)}
        />
      ) : status === 'loading' ? (
        <>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5" aria-busy="true" aria-label="Loading dashboard">
            {Array.from({ length: 5 }).map((_, index) => <div key={index} className="admin-skeleton h-[4.5rem] w-full" />)}
          </div>
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="admin-panel-card"><SectionSkeleton rows={6} /></section>
            <section className="admin-panel-card"><SectionSkeleton rows={4} /></section>
          </div>
        </>
      ) : (
        <>
          <div className="admin-reveal-stagger grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
            <KpiTile
              icon={Package} tint="linear-gradient(135deg,#1E3A8A,#3B82F6)" to="/admin/applications"
              label="Total products" value={applications.length}
              status={productsNeedingAttention.length > 0 ? `${productsNeedingAttention.length} need attention` : 'All clear'}
            />
            <KpiTile
              icon={CheckCircle2} tint="linear-gradient(135deg,#0F766E,#34D399)" to="/admin/applications"
              label="Active products" value={activeProducts.length}
              status={`${applications.length === 0 ? 0 : Math.round((activeProducts.length / applications.length) * 100)}% of catalog`}
            />
            <KpiTile
              icon={Building2} tint="linear-gradient(135deg,#166534,#22C55E)" to="/admin/organizations"
              label="Organizations" value={organizations.length}
              status={`${activeOrgs.length} active · ${trialOrgs.length} trial`}
            />
            <KpiTile
              icon={Users} tint="linear-gradient(135deg,#5B21B6,#8B5CF6)" to="/admin/users"
              label="Users" value={users.length}
              status={`${activeUsers.length} active · ${invitedUsers.length} invited`}
            />
            <KpiTile
              icon={ClipboardList} tint="linear-gradient(135deg,#B45309,#F59E0B)" to="/admin/requests"
              label="Pending requests" value={pendingRequests.length}
              status={oldestPending ? `Oldest: ${formatRelativeDate(oldestPending)}` : 'Nothing pending'}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Product health</h2>
                  <p className="panel-subtitle">Most recently updated products across the registry.</p>
                </div>
                <Link to="/admin/applications" className="text-xs font-bold text-[var(--primary)] hover:underline">View all products</Link>
              </div>
              {productHealthRows.length === 0 ? (
                <EmptyState icon="🗂️" title="No products yet" description="Products added to the registry will appear here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <caption className="sr-only">Most recently updated products</caption>
                    <thead>
                      <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Category</th>
                        <th scope="col">Status</th>
                        <th scope="col">Domain</th>
                        <th scope="col">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productHealthRows.map((app: AdminApplication) => (
                        <tr key={app.id} className="cursor-pointer" onClick={() => navigate(`/admin/applications/${app.id}`)}>
                          <td>
                            <span className="flex items-center gap-2.5 font-bold text-[var(--text-primary)]">
                              <span className="grid size-7 shrink-0 place-items-center rounded-lg text-xs text-white" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
                              <span className="truncate">{app.name}</span>
                            </span>
                          </td>
                          <td className="text-[var(--text-secondary)]">{app.category}</td>
                          <td><StatusBadge status={app.status} kind="application" /></td>
                          <td className="text-[var(--text-muted)]">{domainOf(app.productionUrl)}</td>
                          <td className="text-[var(--text-muted)]">{formatDate(app.updatedAt)}</td>
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
                  <h2 className="panel-title">Access requests</h2>
                  <p className="panel-subtitle">Pending · {RANGE_LABELS[range].toLowerCase()}</p>
                </div>
                <Link to="/admin/requests" className="text-xs font-bold text-[var(--primary)] hover:underline">View all</Link>
              </div>
              {pendingRequests.length === 0 ? (
                <EmptyState icon="✅" title="Nothing pending" description="New access requests will show up here as they arrive." />
              ) : rangedPendingRequests.length === 0 ? (
                <EmptyState icon="🗓️" title="No requests in this range" description={`No pending requests were submitted in the ${RANGE_LABELS[range].toLowerCase()}. Try widening the date range.`} />
              ) : (
                <ul className="divide-y divide-[var(--line-soft)]">
                  {rangedPendingRequests.slice(0, 5).map((request) => {
                    const org = getOrganization(request.orgId);
                    const app = getApplication(request.appId);
                    return (
                      <li key={request.id} className="flex items-center gap-2.5 px-4 py-3">
                        <EntityAvatar name={request.requesterName} size={28} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{request.requesterName}</p>
                          <p className="truncate text-xs text-[var(--text-muted)]">{org?.name ?? request.orgId} · {app?.name ?? request.appId}</p>
                          <p className="truncate text-[0.6875rem] font-semibold text-[var(--text-faint)]">Requested {formatRelativeDate(request.submittedAt)}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <CommonIconButton aria-label={`Approve ${request.requesterName}'s request`} icon={<Check size={15} />} onClick={() => handleApprove(request.id, request.requesterName)} />
                          <CommonIconButton aria-label={`Reject ${request.requesterName}'s request`} variant="danger" icon={<X size={15} />} onClick={() => handleReject(request.id, request.requesterName)} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="admin-panel-card">
              <div className="admin-panel-card__header">
                <div>
                  <h2 className="panel-title">Recent activity</h2>
                  <p className="panel-subtitle">{RANGE_LABELS[range]}</p>
                </div>
              </div>
              {activity.length === 0 ? (
                <EmptyState icon="🕒" title="No activity yet" description="Admin actions will appear here as they happen." />
              ) : rangedActivity.length === 0 ? (
                <EmptyState icon="🗓️" title="No activity in this range" description="Try widening the date range to see older activity." />
              ) : (
                <ul className="flex flex-col gap-3 p-4">
                  {rangedActivity.slice(0, 8).map((item) => {
                    const Icon = ACTIVITY_ICON[item.kind] ?? ClipboardList;
                    return (
                      <li key={item.id} className="flex items-start gap-2.5 text-[0.8125rem]">
                        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)]" aria-hidden="true">
                          <Icon size={12} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[var(--text-primary)]">{item.message}</p>
                          <p className="text-xs text-[var(--text-muted)]">{item.actor} · {formatRelativeDate(item.at)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="admin-panel-card">
              <div className="admin-panel-card__header"><h2 className="panel-title">Quick actions</h2></div>
              <ul className="flex flex-col divide-y divide-[var(--line-soft)]">
                {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link to={to} className="flex items-center gap-2.5 px-4 py-2.5 text-[0.8125rem] font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--hover)]">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--surface-muted)] text-[var(--primary)]" aria-hidden="true"><Icon size={14} /></span>
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                      <ChevronRight size={14} className="shrink-0 text-[var(--text-faint)]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {productsNeedingAttention.length > 0 ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-faint)]">
              <AlertTriangle size={13} className="text-[var(--warning)]" />
              {productsNeedingAttention.length} product{productsNeedingAttention.length === 1 ? '' : 's'} have data-quality warnings — review them from the Products page.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
