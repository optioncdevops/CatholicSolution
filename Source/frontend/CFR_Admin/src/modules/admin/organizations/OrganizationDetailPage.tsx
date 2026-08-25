import { useState, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Eye, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '@app/components/Badge';
import { Dropdown } from '@app/components/formControls';
import { formatDate, formatDateTime, daysUntil, daysBetween, accessStatusOf, effectiveInvoiceStatus } from '../utils/formatDate';
import { EntityAvatar } from '@app/components/EntityAvatar';
import { Tabs, TabPanel } from '@app/components/Tabs';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { InvoiceDetailModal } from '../applications/InvoiceDetailModal';
import type { AccessRequest, AdminApplication, AdminUser, Invoice, InvoiceStatus } from '../types';

const INVOICE_STATUS_FILTERS: Array<{ id: InvoiceStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' },
  { id: 'created', label: 'Created' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'expiring-soon', label: 'Expiring soon' },
  { id: 'cancelled', label: 'Cancelled' },
];

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
      <div className="mt-0.5 truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{children}</div>
    </div>
  );
}

export function OrganizationDetailPage() {
  const { orgId } = useParams();
  const { getOrganization, applications, users, requests, invoices, assignOrgApp, removeOrgApp } = useAdminData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [appToAssign, setAppToAssign] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  const org = orgId ? getOrganization(orgId) : undefined;
  if (!org) return <Navigate to="/admin/organizations" replace />;

  const orgUsers = users.filter((user) => user.orgId === org.id);
  const orgApps = applications.filter((app) => org.appIds.includes(app.id));
  const assignableApps = applications.filter((app) => !org.appIds.includes(app.id));
  const orgRequests = requests.filter((request) => request.orgId === org.id);
  const allOrgInvoices = invoices
    .filter((invoice) => invoice.orgId === org.id)
    .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
  const orgInvoices = allOrgInvoices
    .filter((invoice) => invoiceStatusFilter === 'all' || effectiveInvoiceStatus(invoice.status, invoice.dueDate) === invoiceStatusFilter);

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
      id: 'name', header: 'Name', pinLeft: true, width: '13rem',
      value: (user) => user.name,
      cell: (user) => (
        <span className="flex items-center gap-2.5 font-bold text-[var(--text-primary)]">
          <EntityAvatar name={user.name} size={28} />
          {user.name}
        </span>
      ),
    },
    { id: 'email', header: 'Email', width: '14rem', value: (user) => user.email, cell: (user) => <span className="text-[var(--text-secondary)]">{user.email}</span> },
    { id: 'role', header: 'Role', value: (user) => user.role, cell: (user) => <span className="capitalize text-[var(--text-secondary)]">{user.role}</span> },
    { id: 'status', header: 'Status', value: (user) => user.status, cell: (user) => <StatusBadge status={user.status} kind="user" /> },
    {
      id: 'access', header: 'App Access', width: '16rem',
      value: (user) => user.appAccessIds.length,
      cell: (user) => {
        const accessApps = applications.filter((app) => user.appAccessIds.includes(app.id));
        if (accessApps.length === 0) return <span className="text-[var(--text-faint)]">None</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {accessApps.map((app) => (
              <span key={app.id} className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[0.6875rem] font-bold text-[var(--text-secondary)]">{app.shortName}</span>
            ))}
          </div>
        );
      },
    },
    { id: 'lastActive', header: 'Last Active', value: (user) => user.lastActiveAt, cell: (user) => <span className="text-[var(--text-muted)]">{user.lastActiveAt === '—' ? '—' : formatDate(user.lastActiveAt)}</span> },
  ];

  const invoiceColumns: DataTableColumn<Invoice>[] = [
    {
      id: 'actions', header: 'Actions', pinLeft: true, width: '4rem', excludeFromExport: true,
      cell: (invoice) => <CommonIconButton aria-label={`View invoice ${invoice.invoiceNumber}`} tooltip="View" icon={<Eye size={15} />} onClick={() => setViewingInvoice(invoice)} />,
    },
    {
      id: 'product', header: 'Product', width: '12rem',
      value: (invoice) => applications.find((app) => app.id === invoice.appId)?.name ?? invoice.appId,
      cell: (invoice) => <span className="font-bold text-[var(--text-primary)]">{applications.find((app) => app.id === invoice.appId)?.name ?? invoice.appId}</span>,
    },
    { id: 'invoiceNumber', header: 'Invoice #', value: (invoice) => invoice.invoiceNumber, cell: (invoice) => <span className="font-mono text-xs text-[var(--text-secondary)]">{invoice.invoiceNumber}</span> },
    { id: 'invoiceDate', header: 'Invoice Date', value: (invoice) => invoice.invoiceDate, cell: (invoice) => <span className="text-[var(--text-muted)]">{formatDate(invoice.invoiceDate)}</span> },
    { id: 'dueDate', header: 'Due Date', value: (invoice) => invoice.dueDate, cell: (invoice) => <span className="text-[var(--text-muted)]">{formatDate(invoice.dueDate)}</span> },
    {
      id: 'days', header: 'Days', value: (invoice) => invoice.dueDate,
      cell: (invoice) => {
        if (invoice.status === 'cancelled') return <span className="text-[var(--text-muted)]">—</span>;
        const remaining = invoice.status === 'paid' && invoice.paidDate
          ? daysBetween(invoice.paidDate, invoice.dueDate)
          : daysUntil(invoice.dueDate);
        return <span className={remaining < 0 ? 'font-bold text-[var(--error)]' : 'text-[var(--text-muted)]'}>{remaining}</span>;
      },
    },
    { id: 'total', header: 'Total', value: (invoice) => invoice.amount * invoice.quantity, cell: (invoice) => <span className="font-bold text-[var(--text-primary)]">${(invoice.amount * invoice.quantity).toFixed(2)}</span> },
    { id: 'paidDate', header: 'Paid On', value: (invoice) => invoice.paidDate ?? '', cell: (invoice) => <span className="text-[var(--text-muted)]">{invoice.paidDate ? formatDateTime(invoice.paidDate) : 'Not paid yet'}</span> },
    { id: 'status', header: 'Status', value: (invoice) => effectiveInvoiceStatus(invoice.status, invoice.dueDate), cell: (invoice) => <StatusBadge status={effectiveInvoiceStatus(invoice.status, invoice.dueDate)} kind="invoice" /> },
  ];

  const productColumns: DataTableColumn<AdminApplication>[] = [
    {
      id: 'name', header: 'Product', pinLeft: true, width: '14rem', value: (app) => app.name,
      cell: (app) => (
        <Link to={`/admin/applications/${app.id}`} className="flex min-w-0 items-center gap-2.5 hover:underline">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg text-sm text-white" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
          <span className="truncate font-bold text-[var(--text-primary)]">{app.name}</span>
        </Link>
      ),
    },
    { id: 'category', header: 'Category', value: (app) => app.category, cell: (app) => <span className="text-[var(--text-secondary)]">{app.category}</span> },
    { id: 'licenseType', header: 'License Type', value: (app) => app.licenseType, cell: (app) => <span className="capitalize text-[var(--text-secondary)]">{app.licenseType}</span> },
    { id: 'status', header: 'Status', value: (app) => app.status, cell: (app) => <StatusBadge status={app.status} kind="application" /> },
    {
      id: 'actions', header: 'Actions', width: '4rem', excludeFromExport: true, sortable: false,
      cell: (app) => <CommonIconButton aria-label={`Remove ${app.name}`} tooltip="Remove" variant="danger" icon={<Trash2 size={14} />} onClick={() => handleRemove(app.id, app.name)} />,
    },
  ];

  const requestColumns: DataTableColumn<AccessRequest>[] = [
    { id: 'requester', header: 'Requester', pinLeft: true, width: '13rem', value: (request) => request.requesterName, cell: (request) => <span className="font-bold text-[var(--text-primary)]">{request.requesterName}</span> },
    { id: 'application', header: 'Application', value: (request) => applications.find((app) => app.id === request.appId)?.name ?? request.appId, cell: (request) => <span className="text-[var(--text-secondary)]">{applications.find((app) => app.id === request.appId)?.name ?? request.appId}</span> },
    { id: 'status', header: 'Status', value: (request) => request.status, cell: (request) => <StatusBadge status={request.status} kind="request" /> },
    { id: 'submittedAt', header: 'Submitted', value: (request) => request.submittedAt, cell: (request) => <span className="text-[var(--text-muted)]">{formatDate(request.submittedAt)}</span> },
    {
      id: 'lastUpdate', header: 'Latest Update', width: '16rem',
      value: (request) => request.timeline.at(-1)?.note ?? '',
      cell: (request) => {
        const latest = request.timeline.at(-1);
        if (!latest) return <span className="text-[var(--text-faint)]">—</span>;
        return (
          <span className="text-[var(--text-muted)]">
            {latest.note ?? `${latest.status.replace('-', ' ')} by ${latest.actor}`}
          </span>
        );
      },
    },
  ];

  const accessStatus = accessStatusOf(org.expiryDate);

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={org.name}
        icon={<EntityAvatar name={org.name} size={40} square />}
        action={<StatusBadge status={org.status} kind="organization" />}
      />

      <Tabs
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'profile', label: 'Profile' },
          { id: 'users', label: 'Users', count: orgUsers.length },
          { id: 'products', label: 'Products', count: orgApps.length },
          { id: 'invoices', label: 'Invoices', count: allOrgInvoices.length },
          { id: 'requests', label: 'Requests', count: orgRequests.length },
        ]}
      />

      <TabPanel id="profile" activeId={activeTab}>
        <section className="admin-panel-card">
          <div className="admin-panel-card__header"><h2 className="panel-title">Organization Details</h2></div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-3 p-4 sm:grid-cols-3">
            <Fact label="Customer Code"><span className="font-mono">{org.code}</span></Fact>
            <Fact label="Website">
              <a href={`https://${org.domain}`} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">{org.domain}</a>
            </Fact>
            <Fact label="Plan"><span className="capitalize">{org.plan}</span></Fact>
            <Fact label="Status"><StatusBadge status={org.status} kind="organization" /></Fact>
            <Fact label="Access Status"><StatusBadge status={accessStatus} kind="access" /></Fact>
            <Fact label="Access Expiry Date">{formatDate(org.expiryDate)}</Fact>
            <Fact label="Created On">{formatDateTime(org.createdAt)}</Fact>
            <Fact label="Users"><Link to="#" onClick={(event) => { event.preventDefault(); setActiveTab('users'); }} className="hover:underline">{orgUsers.length}</Link></Fact>
            <Fact label="Products"><Link to="#" onClick={(event) => { event.preventDefault(); setActiveTab('products'); }} className="hover:underline">{orgApps.length}</Link></Fact>
          </div>
        </section>

        <section className="admin-panel-card mt-3">
          <div className="admin-panel-card__header"><h2 className="panel-title">Primary Contact</h2></div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-3 p-4 sm:grid-cols-3">
            <Fact label="Contact Person">{org.primaryContact}</Fact>
            <Fact label="Contact Email">
              <a href={`mailto:${org.contactEmail}`} className="text-[var(--primary)] hover:underline">{org.contactEmail}</a>
            </Fact>
            <Fact label="Contact Number">
              <a href={`tel:${org.contactPhone}`} className="text-[var(--primary)] hover:underline">{org.contactPhone}</a>
            </Fact>
          </div>
        </section>
      </TabPanel>

      <TabPanel id="users" activeId={activeTab}>
        {orgUsers.length === 0 ? (
          <EmptyState icon="👥" title="No users yet" description="Users who join this organization will appear here." />
        ) : (
          <DataTable
            data={orgUsers}
            columns={userColumns}
            getRowId={(user) => user.id}
            exportFileName={`${org.name}-users`}
            exportTitle={`${org.name} — Users`}
            emptyMessage="No users found."
          />
        )}
      </TabPanel>

      <TabPanel id="products" activeId={activeTab}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-64 shrink-0">
              <Dropdown
                label="Product to assign" hideLabel searchable={false} clearable={false}
                value={appToAssign || undefined}
                onValueChange={(value) => setAppToAssign(value ?? '')}
                options={assignableApps.map((app) => ({ id: app.id, value: app.name }))}
                placeholder="Select a product to assign…"
                className="min-h-8"
              />
            </div>
            <CommonButton variant="primary" size="sm" iconLeft={<Plus size={14} />} onClick={handleAssign} disabled={!appToAssign}>Assign</CommonButton>
          </div>
          {orgApps.length === 0 ? (
            <EmptyState icon="🧩" title="No products assigned" description="Assign a product above to give this organization access." />
          ) : (
            <DataTable
              data={orgApps}
              columns={productColumns}
              getRowId={(app) => app.id}
              exportFileName={`${org.name}-products`}
              exportTitle={`${org.name} — Products`}
              emptyMessage="No products found."
            />
          )}
        </div>
      </TabPanel>

      <TabPanel id="invoices" activeId={activeTab}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
            {INVOICE_STATUS_FILTERS.map((filter) => {
              const count = filter.id === 'all' ? allOrgInvoices.length : allOrgInvoices.filter((invoice) => effectiveInvoiceStatus(invoice.status, invoice.dueDate) === filter.id).length;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setInvoiceStatusFilter(filter.id)}
                  className={`admin-filter-chip ${invoiceStatusFilter === filter.id ? 'admin-filter-chip--active' : ''}`}
                >
                  {filter.label} ({count})
                </button>
              );
            })}
          </div>
          {orgInvoices.length === 0 ? (
            <EmptyState icon="🧾" title="No invoices found" description="Try a different status filter." />
          ) : (
            <DataTable
              data={orgInvoices}
              columns={invoiceColumns}
              getRowId={(invoice) => invoice.id}
              exportFileName={`${org.name}-invoices`}
              exportTitle={`${org.name} — Invoices`}
              emptyMessage="No invoices found."
            />
          )}
        </div>
      </TabPanel>

      <TabPanel id="requests" activeId={activeTab}>
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <Link to="/admin/requests"><CommonButton variant="outline" size="sm" iconLeft={<ExternalLink size={13} />}>View All Requests</CommonButton></Link>
          </div>
          {orgRequests.length === 0 ? (
            <EmptyState icon="📥" title="No requests" description="Access requests from this organization will appear here." />
          ) : (
            <DataTable
              data={orgRequests}
              columns={requestColumns}
              getRowId={(request) => request.id}
              initialSort={[{ id: 'submittedAt', desc: true }]}
              exportFileName={`${org.name}-requests`}
              exportTitle={`${org.name} — Requests`}
              emptyMessage="No requests found."
            />
          )}
        </div>
      </TabPanel>

      <InvoiceDetailModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
    </div>
  );
}
