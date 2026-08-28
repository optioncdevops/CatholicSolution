import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { CommonIconButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate, accessStatusOf } from '../utils/formatDate';
import type { AdminApplication, Organization, OrganizationStatus } from '../types';

/** The one status this tab shows and filters by — access takes priority over the account
 * plan/status once it's expiring or expired, since that's the more urgent signal. */
type EffectiveStatus = OrganizationStatus | 'expiring-soon' | 'expired';

function effectiveStatusOf(org: Organization): EffectiveStatus {
  const access = accessStatusOf(org.expiryDate);
  if (access === 'expired' || access === 'expiring-soon') return access;
  return org.status;
}

const STATUS_FILTERS: Array<{ id: EffectiveStatus | 'all'; label: string; dot?: string }> = [
  { id: 'all', label: 'All Statuses' },
  { id: 'active', label: 'Active', dot: 'var(--success)' },
  { id: 'trial', label: 'Trial', dot: 'var(--info)' },
  { id: 'suspended', label: 'Suspended', dot: 'var(--text-secondary)' },
  { id: 'expiring-soon', label: 'Expiring Soon', dot: 'var(--warning)' },
  { id: 'expired', label: 'Expired', dot: 'var(--error)' },
];

export function ProductCustomersTab({ app }: { app: AdminApplication }) {
  const { organizations, users } = useAdminData();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<EffectiveStatus | 'all'>('all');

  const userCountFor = useCallback((orgId: string) => users.filter((user) => user.orgId === orgId).length, [users]);

  const productCustomers = useMemo(() => organizations.filter((org) => org.appIds.includes(app.id)), [organizations, app.id]);

  const customers = useMemo(() => productCustomers
    .filter((org) => statusFilter === 'all' || effectiveStatusOf(org) === statusFilter)
    .sort((a, b) => a.name.localeCompare(b.name)),
  [productCustomers, statusFilter]);

  const columns: DataTableColumn<Organization>[] = [
    {
      id: 'actions', header: 'Actions', pinLeft: true, width: '4rem', excludeFromExport: true,
      cell: (org) => <CommonIconButton aria-label={`View ${org.name}`} tooltip="View" icon={<Eye size={15} />} onClick={() => navigate(`/admin/organizations/${org.id}`)} />,
    },
    {
      id: 'name', header: 'Organization', width: '14rem', value: (org) => org.name,
      cell: (org) => (
        <Link to={`/admin/organizations/${org.id}`} className="block min-w-0 truncate font-bold text-[var(--text-primary)] hover:underline" onClick={(event) => event.stopPropagation()}>
          {org.name}
        </Link>
      ),
    },
    { id: 'customerName', header: 'Customer Name', width: '12rem', value: (org) => org.primaryContact, cell: (org) => <span className="text-[var(--text-secondary)]">{org.primaryContact}</span> },
    { id: 'code', header: 'Code', value: (org) => org.code, cell: (org) => <span className="font-mono text-xs text-[var(--text-secondary)]">{org.code}</span> },
    { id: 'email', header: 'Email', value: (org) => org.contactEmail, cell: (org) => <span className="text-[var(--text-secondary)]">{org.contactEmail}</span> },
    { id: 'users', header: 'Users', value: (org) => userCountFor(org.id), cell: (org) => <span className="text-[var(--text-secondary)]">{userCountFor(org.id)}</span> },
    { id: 'start', header: 'Start Date', value: (org) => org.createdAt, cell: (org) => <span className="text-[var(--text-muted)]">{formatDate(org.createdAt)}</span> },
    { id: 'expiry', header: 'Expiry Date', value: (org) => org.expiryDate, cell: (org) => <span className="text-[var(--text-muted)]">{formatDate(org.expiryDate)}</span> },
    {
      id: 'status', header: 'Status', value: (org) => effectiveStatusOf(org),
      cell: (org) => {
        const status = effectiveStatusOf(org);
        return status === 'expired' || status === 'expiring-soon'
          ? <StatusBadge status={status} kind="access" />
          : <StatusBadge status={status} kind="organization" />;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
        {STATUS_FILTERS.map((filter) => {
          const count = filter.id === 'all' ? productCustomers.length : productCustomers.filter((org) => effectiveStatusOf(org) === filter.id).length;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`admin-filter-chip inline-flex items-center gap-1.5 ${statusFilter === filter.id ? 'admin-filter-chip--active' : ''}`}
            >
              {filter.dot ? <span className="size-1.5 shrink-0 rounded-full" style={{ background: filter.dot }} aria-hidden="true" /> : null}
              {filter.label} ({count})
            </button>
          );
        })}
      </div>

      <DataTable
        data={customers}
        columns={columns}
        getRowId={(org) => org.id}
        onRowClick={(org) => navigate(`/admin/organizations/${org.id}`)}
        exportFileName={`${app.shortName}-customers`}
        exportTitle={`${app.name} — Customers`}
        emptyMessage="No customers found."
      />
    </div>
  );
}
