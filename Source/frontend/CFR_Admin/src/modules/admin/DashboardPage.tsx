import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ClipboardList, Package, Users } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useAdminData } from './AdminDataContext';
import { StatusBadge } from './components/Badge';
import { EntityAvatar } from './components/EntityAvatar';
import type { OrganizationStatus, ProductStatus, RequestStatus, UserStatus } from './types';

const KPI_TILES = [
  { key: 'applications', label: 'Products', icon: Package, tint: 'linear-gradient(135deg,#1E3A8A,#3B82F6)', to: '/admin/applications' },
  { key: 'organizations', label: 'Organizations', icon: Building2, tint: 'linear-gradient(135deg,#166534,#22C55E)', to: '/admin/organizations' },
  { key: 'users', label: 'Users', icon: Users, tint: 'linear-gradient(135deg,#5B21B6,#8B5CF6)', to: '/admin/users' },
  { key: 'requests', label: 'Pending requests', icon: ClipboardList, tint: 'linear-gradient(135deg,#B45309,#F59E0B)', to: '/admin/requests' },
] as const;

const PRODUCT_STATUSES: ProductStatus[] = ['active', 'inactive', 'coming-soon', 'on-request', 'archived'];
const ORGANIZATION_STATUSES: OrganizationStatus[] = ['active', 'trial', 'suspended'];
const USER_STATUSES: UserStatus[] = ['active', 'invited', 'deactivated'];
const REQUEST_STATUSES: RequestStatus[] = ['pending', 'approved', 'rejected', 'info-requested'];
const PLAN_LABELS: Record<string, string> = { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' };
const PLAN_TINTS: Record<string, string> = { starter: '#64748B', growth: 'var(--secondary)', enterprise: 'var(--primary)' };

function DistributionBars({ items }: { items: Array<{ label: string; value: number; tint: string }> }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <ul className="flex flex-col gap-3 p-4">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs font-bold text-[var(--text-secondary)]">{item.label}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <span className="block h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, background: item.tint }} />
          </span>
          <span className="w-6 shrink-0 text-right text-xs font-extrabold text-[var(--text-primary)]">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function DashboardPage() {
  const { applications, organizations, users, requests, getOrganization, getApplication } = useAdminData();

  const pendingRequests = requests.filter((request) => request.status === 'pending');
  const statusCounts = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
    return acc;
  }, {});
  const orgStatusCounts = organizations.reduce<Record<string, number>>((acc, org) => {
    acc[org.status] = (acc[org.status] ?? 0) + 1;
    return acc;
  }, {});
  const userStatusCounts = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.status] = (acc[user.status] ?? 0) + 1;
    return acc;
  }, {});
  const requestStatusCounts = requests.reduce<Record<string, number>>((acc, request) => {
    acc[request.status] = (acc[request.status] ?? 0) + 1;
    return acc;
  }, {});
  const planCounts = organizations.reduce<Record<string, number>>((acc, org) => {
    acc[org.plan] = (acc[org.plan] ?? 0) + 1;
    return acc;
  }, {});
  const kpiValues: Record<string, { value: number; detail: string }> = {
    applications: { value: applications.length, detail: `${statusCounts.active ?? 0} active` },
    organizations: { value: organizations.length, detail: `${organizations.filter((o) => o.status === 'active').length} active` },
    users: { value: users.length, detail: `${users.filter((u) => u.status === 'active').length} active` },
    requests: { value: pendingRequests.length, detail: 'Awaiting review' },
  };

  return (
    <div className="admin-reveal flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-extrabold uppercase tracking-[0.14em] text-[var(--secondary)]">Platform overview</p>
          <h1 className="dashboard-heading">Good to see you, Carl.</h1>
          <p className="dashboard-description">Products, organizations and pending work across Catholic Solutions, at a glance.</p>
        </div>
        <Link to="/admin/applications" className="action-primary inline-flex items-center gap-1.5 shadow-[0_10px_24px_-8px_rgba(18,38,76,.45)]">
          <Package size={15} /> Manage products
        </Link>
      </div>

      <div className="admin-reveal-stagger grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {KPI_TILES.map(({ key, label, icon: Icon, tint, to }) => {
          const kpi = kpiValues[key];
          return (
            <Link key={key} to={to} className="admin-kpi-tile">
              <span className="admin-kpi-tile__icon" style={{ background: tint }}><Icon size={18} /></span>
              <span className="min-w-0">
                <span className="metric-label block text-[var(--text-faint)]">{label}</span>
                <span className="metric-value block leading-tight">{kpi.value}</span>
                <span className="block truncate text-[0.6875rem] font-semibold text-[var(--text-muted)]">{kpi.detail}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div>
              <h2 className="panel-title">Organizations by plan</h2>
              <p className="panel-subtitle">Mix of subscription tiers across your customer base.</p>
            </div>
          </div>
          <DistributionBars items={['starter', 'growth', 'enterprise'].map((plan) => ({ label: PLAN_LABELS[plan], value: planCounts[plan] ?? 0, tint: PLAN_TINTS[plan] }))} />
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div>
              <h2 className="panel-title">Requests by status</h2>
              <p className="panel-subtitle">How incoming access requests are trending.</p>
            </div>
            <Link to="/admin/requests" className="text-xs font-bold text-[var(--primary)] hover:underline">View all</Link>
          </div>
          <DistributionBars
            items={REQUEST_STATUSES.map((status) => ({
              label: status.replace('-', ' '),
              value: requestStatusCounts[status] ?? 0,
              tint: status === 'pending' ? 'var(--warning)' : status === 'approved' ? 'var(--success)' : status === 'rejected' ? 'var(--error)' : 'var(--info)',
            }))}
          />
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div>
              <h2 className="panel-title">Product health</h2>
              <p className="panel-subtitle">Publish status across the product registry.</p>
            </div>
            <Link to="/admin/applications" className="text-xs font-bold text-[var(--primary)] hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-5">
            {PRODUCT_STATUSES.map((status) => (
              <div key={status} className="admin-health-tile">
                <StatusBadge status={status} kind="application" />
                <p className="mt-2.5 font-display text-2xl font-extrabold text-[var(--text-primary)]">{statusCounts[status] ?? 0}</p>
                <p className="text-xs text-[var(--text-muted)]">product{(statusCounts[status] ?? 0) === 1 ? '' : 's'}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div>
              <h2 className="panel-title">Organizations &amp; users</h2>
              <p className="panel-subtitle">Where your accounts stand right now.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Organizations</p>
              <ul className="flex flex-col gap-2">
                {ORGANIZATION_STATUSES.map((status) => (
                  <li key={status} className="flex items-center justify-between gap-2">
                    <StatusBadge status={status} kind="organization" />
                    <span className="text-sm font-extrabold text-[var(--text-primary)]">{orgStatusCounts[status] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Users</p>
              <ul className="flex flex-col gap-2">
                {USER_STATUSES.map((status) => (
                  <li key={status} className="flex items-center justify-between gap-2">
                    <StatusBadge status={status} kind="user" />
                    <span className="text-sm font-extrabold text-[var(--text-primary)]">{userStatusCounts[status] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <section className="admin-panel-card">
        <div className="admin-panel-card__header">
          <div>
            <h2 className="panel-title">Needs attention</h2>
            <p className="panel-subtitle">Pending access requests waiting on a decision.</p>
          </div>
          <Link to="/admin/requests" className="text-xs font-bold text-[var(--primary)] hover:underline">Review all</Link>
        </div>
        {pendingRequests.length === 0 ? (
          <EmptyState icon="✅" title="Nothing pending" description="New access requests will show up here as they arrive." />
        ) : (
          <ul className="grid divide-y divide-[var(--line-soft)] lg:grid-cols-2 lg:divide-y-0">
            {pendingRequests.slice(0, 6).map((request) => {
              const org = getOrganization(request.orgId);
              const app = getApplication(request.appId);
              return (
                <li key={request.id} className="lg:border-b lg:border-[var(--line-soft)] lg:odd:border-r">
                  <Link to="/admin/requests" className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--hover)]">
                    <EntityAvatar name={request.requesterName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{request.requesterName} · {app?.name ?? request.appId}</p>
                      <p className="truncate text-xs text-[var(--text-muted)]">{org?.name ?? request.orgId} · Submitted {request.submittedAt}</p>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-[var(--text-faint)]" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
