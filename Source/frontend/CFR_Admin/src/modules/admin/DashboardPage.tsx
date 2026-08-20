import { Link } from 'react-router-dom';
import { EmptyState } from '@shared/app/components/EmptyState';
import {
  AppsIcon, BuildingIcon, ClipboardIcon, PlusIcon, UsersIcon,
} from '@shared/app/components/UiIcons';
import { useAdminData } from './AdminDataContext';
import { StatusBadge } from './components/Badge';
import { EntityAvatar } from './components/EntityAvatar';

const KPI_TILES = [
  { key: 'applications', label: 'Applications', icon: AppsIcon, tint: 'linear-gradient(135deg,#1E3A8A,#3B82F6)' },
  { key: 'organizations', label: 'Organizations', icon: BuildingIcon, tint: 'linear-gradient(135deg,#166534,#22C55E)' },
  { key: 'users', label: 'Users', icon: UsersIcon, tint: 'linear-gradient(135deg,#5B21B6,#8B5CF6)' },
  { key: 'requests', label: 'Pending requests', icon: ClipboardIcon, tint: 'linear-gradient(135deg,#B45309,#F59E0B)' },
] as const;

const QUICK_ACTIONS = [
  { to: '/admin/applications/new', label: 'Add application', description: 'Publish a new registry entry', icon: PlusIcon, tint: 'linear-gradient(135deg,#1E3A8A,#3B82F6)' },
  { to: '/admin/requests', label: 'Review requests', description: 'Approve or reject pending access', icon: ClipboardIcon, tint: 'linear-gradient(135deg,#B45309,#F59E0B)' },
  { to: '/admin/organizations', label: 'Manage organizations', description: 'Assign apps, review plans', icon: BuildingIcon, tint: 'linear-gradient(135deg,#166534,#22C55E)' },
  { to: '/admin/users', label: 'Manage users', description: 'Grant access, activate accounts', icon: UsersIcon, tint: 'linear-gradient(135deg,#5B21B6,#8B5CF6)' },
];

export function DashboardPage() {
  const { applications, organizations, users, requests, activity, getOrganization, getApplication } = useAdminData();

  const pendingRequests = requests.filter((request) => request.status === 'pending');
  const recentRequests = requests.slice(0, 5);
  const statusCounts = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
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
          <p className="dashboard-description">Applications, organizations and pending work across Catholic Solutions, at a glance.</p>
        </div>
        <Link to="/admin/applications/new" className="action-primary inline-flex items-center gap-1.5 shadow-[0_10px_24px_-8px_rgba(18,38,76,.45)]">
          <PlusIcon size={15} /> New application
        </Link>
      </div>

      <div className="admin-reveal-stagger grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {KPI_TILES.map(({ key, label, icon: Icon, tint }) => {
          const kpi = kpiValues[key];
          return (
            <article key={key} className="admin-kpi-tile">
              <span className="admin-kpi-tile__icon" style={{ background: tint }}><Icon size={18} /></span>
              <p className="metric-label mt-3 text-[var(--text-faint)]">{label}</p>
              <p className="metric-value">{kpi.value}</p>
              <p className="mt-1 text-[0.6875rem] font-semibold text-[var(--text-muted)]">{kpi.detail}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="admin-panel-card lg:col-span-2">
          <div className="admin-panel-card__header">
            <h2 className="panel-title">Recent access requests</h2>
            <Link to="/admin/requests" className="text-xs font-bold text-[var(--primary)] hover:underline">View all</Link>
          </div>
          {recentRequests.length === 0 ? (
            <EmptyState icon="📥" title="No requests yet" description="Access requests submitted by organizations will show up here." />
          ) : (
            <ul className="divide-y divide-[var(--line-soft)]">
              {recentRequests.map((request) => {
                const org = getOrganization(request.orgId);
                const app = getApplication(request.appId);
                return (
                  <li key={request.id}>
                    <Link to="/admin/requests" className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--hover)]">
                      <EntityAvatar name={request.requesterName} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{request.requesterName} · {app?.name ?? request.appId}</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">{org?.name ?? request.orgId} · Submitted {request.submittedAt}</p>
                      </div>
                      <StatusBadge status={request.status} kind="request" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__header">
            <h2 className="panel-title">Recent activity</h2>
          </div>
          {activity.length === 0 ? (
            <EmptyState icon="🕒" title="No activity yet" description="Admin actions will appear here as they happen." />
          ) : (
            <ul className="flex flex-col gap-3.5 px-4 py-3.5">
              {activity.slice(0, 6).map((item) => (
                <li key={item.id} className="flex gap-2.5 text-[0.8125rem]">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--secondary)]" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)]">{item.message}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.actor} · {item.at}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="admin-panel-card">
        <div className="admin-panel-card__header">
          <div>
            <h2 className="panel-title">Product health overview</h2>
            <p className="panel-subtitle">Publish status across the application registry.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          {(['active', 'on-request', 'coming-soon', 'future'] as const).map((status) => (
            <div key={status} className="admin-health-tile">
              <StatusBadge status={status} kind="application" />
              <p className="mt-2.5 font-display text-2xl font-extrabold text-[var(--text-primary)]">{statusCounts[status] ?? 0}</p>
              <p className="text-xs text-[var(--text-muted)]">application{(statusCounts[status] ?? 0) === 1 ? '' : 's'}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="panel-title mb-3">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map(({ to, label, description, icon: Icon, tint }) => (
            <Link key={to} to={to} className="admin-quick-action">
              <span className="admin-quick-action__icon" style={{ background: tint }}><Icon size={17} /></span>
              <span className="min-w-0">
                <span className="block truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{label}</span>
                <span className="block truncate text-xs text-[var(--text-muted)]">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
