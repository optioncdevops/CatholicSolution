import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '@app/components/Badge';
import { formatDate } from '../utils/formatDate';
import { EntityAvatar } from '@app/components/EntityAvatar';
import { Tabs, TabPanel } from '@app/components/Tabs';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import type { AdminUser } from '../types';

export function OrganizationDetailPage() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { getOrganization, applications, users, requests, assignOrgApp, removeOrgApp } = useAdminData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [appToAssign, setAppToAssign] = useState('');

  const org = orgId ? getOrganization(orgId) : undefined;
  if (!org) return <Navigate to="/admin/organizations" replace />;

  const orgUsers = users.filter((user) => user.orgId === org.id);
  const orgApps = applications.filter((app) => org.appIds.includes(app.id));
  const assignableApps = applications.filter((app) => !org.appIds.includes(app.id));
  const orgRequests = requests.filter((request) => request.orgId === org.id);

  const handleAssign = () => {
    if (!appToAssign) return;
    const app = applications.find((item) => item.id === appToAssign);
    assignOrgApp(org.id, appToAssign);
    if (app) showToast(`${app.name} assigned to ${org.name} ✓`);
    setAppToAssign('');
  };

  const handleRemove = (appId: string, appName: string) => {
    removeOrgApp(org.id, appId);
    showToast(`${appName} removed from ${org.name}`);
  };

  const userColumns: DataTableColumn<AdminUser>[] = [
    {
      id: 'name', header: 'Name', pinLeft: true, width: '14rem',
      value: (user) => `${user.name} (${user.email})`,
      cell: (user) => (
        <Link to={`/admin/users/${user.id}`} className="font-bold text-[var(--text-primary)] hover:underline">
          {user.name}
          <div className="text-xs font-semibold text-[var(--text-muted)]">{user.email}</div>
        </Link>
      ),
    },
    { id: 'role', header: 'Role', value: (user) => user.role, cell: (user) => <span className="capitalize text-[var(--text-secondary)]">{user.role}</span> },
    { id: 'status', header: 'Status', value: (user) => user.status, cell: (user) => <StatusBadge status={user.status} kind="user" /> },
    { id: 'access', header: 'App Access', value: (user) => user.appAccessIds.length, cell: (user) => <span className="text-[var(--text-secondary)]">{user.appAccessIds.length}</span> },
  ];

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        breadcrumb={{ label: 'Organizations', to: '/admin/organizations' }}
        title={org.name}
        icon={<EntityAvatar name={org.name} size={40} square />}
        subtitle={org.domain}
        action={<StatusBadge status={org.status} kind="organization" />}
      />

      <Tabs
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'profile', label: 'Profile' },
          { id: 'users', label: 'Users', count: orgUsers.length },
          { id: 'products', label: 'Products', count: orgApps.length },
          { id: 'requests', label: 'Requests', count: orgRequests.length },
        ]}
      />

      <TabPanel id="profile" activeId={activeTab}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Plan', org.plan],
            ['Status', org.status],
            ['Created', formatDate(org.createdAt)],
            ['Domain', org.domain],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-3.5">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
              <p className="mt-1 truncate text-sm font-bold capitalize text-[var(--text-primary)]">{value}</p>
            </div>
          ))}
        </div>
      </TabPanel>

      <TabPanel id="users" activeId={activeTab}>
        {orgUsers.length === 0 ? (
          <EmptyState icon="👥" title="No users yet" description="Users who join this organization will appear here." />
        ) : (
          <DataTable
            data={orgUsers}
            columns={userColumns}
            getRowId={(user) => user.id}
            onRowClick={(user) => navigate(`/admin/users/${user.id}`)}
            exportFileName={`${org.name}-users`}
            exportTitle={`${org.name} — Users`}
            emptyMessage="No users found."
          />
        )}
      </TabPanel>

      <TabPanel id="products" activeId={activeTab}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={appToAssign}
              onChange={(event) => setAppToAssign(event.target.value)}
              aria-label="Assign a product"
              className="rounded-[var(--radius-control)] border border-[var(--line)] px-2.5 py-2 text-xs font-bold text-[var(--text-secondary)]"
            >
              <option value="">Select a product to assign…</option>
              {assignableApps.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}
            </select>
            <button type="button" onClick={handleAssign} disabled={!appToAssign} className="action-primary disabled:cursor-not-allowed disabled:opacity-50">Assign</button>
          </div>
          {orgApps.length === 0 ? (
            <EmptyState icon="🧩" title="No products assigned" description="Assign a product above to give this organization access." />
          ) : (
            <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)]">
              {orgApps.map((app) => (
                <li key={app.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <Link to={`/admin/applications/${app.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg text-sm text-white" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--text-primary)] hover:underline">{app.name}</p>
                      <p className="truncate text-xs text-[var(--text-muted)]">{app.category}</p>
                    </div>
                  </Link>
                  <StatusBadge status={app.status} kind="application" />
                  <button type="button" onClick={() => handleRemove(app.id, app.name)} className="shrink-0 rounded-[var(--radius-control)] border border-[var(--line)] px-2.5 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:border-[var(--error)] hover:text-[var(--error)]">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </TabPanel>

      <TabPanel id="requests" activeId={activeTab}>
        {orgRequests.length === 0 ? (
          <EmptyState icon="📥" title="No requests" description="Access requests from this organization will appear here." />
        ) : (
          <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)]">
            {orgRequests.map((request) => (
              <li key={request.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--text-primary)]">{request.requesterName} · {applications.find((a) => a.id === request.appId)?.name ?? request.appId}</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">Submitted {formatDate(request.submittedAt)}</p>
                </div>
                <StatusBadge status={request.status} kind="request" />
              </li>
            ))}
          </ul>
        )}
      </TabPanel>
    </div>
  );
}
