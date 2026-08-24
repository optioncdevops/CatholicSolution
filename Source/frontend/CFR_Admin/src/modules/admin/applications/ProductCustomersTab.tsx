import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { CommonIconButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '@app/components/Badge';
import { InputField, Dropdown } from '@app/components/formControls';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate, accessStatusOf } from '../utils/formatDate';
import type { AdminApplication, CustomerAccessStatus, Organization, OrganizationStatus } from '../types';

const ACCOUNT_STATUS_FILTERS: Array<{ id: OrganizationStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' }, { id: 'active', label: 'Active' }, { id: 'trial', label: 'Trial' }, { id: 'suspended', label: 'Suspended' },
];

const SORT_OPTIONS = [
  { id: 'name', label: 'Name (A–Z)' },
  { id: 'expiry', label: 'Expiry date' },
  { id: 'start', label: 'Start date' },
  { id: 'users', label: 'Most users' },
] as const;
type SortOption = (typeof SORT_OPTIONS)[number]['id'];

export function ProductCustomersTab({ app }: { app: AdminApplication }) {
  const { organizations, users } = useAdminData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState<OrganizationStatus | 'all'>('all');
  const [expiryFilter, setExpiryFilter] = useState<CustomerAccessStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const userCountFor = useCallback((orgId: string) => users.filter((user) => user.orgId === orgId).length, [users]);

  const customers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = organizations
      .filter((org) => org.appIds.includes(app.id))
      .filter((org) => accountFilter === 'all' || org.status === accountFilter)
      .filter((org) => expiryFilter === 'all' || accessStatusOf(org.expiryDate) === expiryFilter)
      .filter((org) => !normalized || [org.name, org.code, org.primaryContact, org.contactEmail].join(' ').toLowerCase().includes(normalized));

    const sorted = [...filtered];
    if (sortBy === 'expiry') sorted.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
    else if (sortBy === 'start') sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sortBy === 'users') sorted.sort((a, b) => userCountFor(b.id) - userCountFor(a.id));
    else sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [organizations, app.id, accountFilter, expiryFilter, query, sortBy, userCountFor]);

  const columns: DataTableColumn<Organization>[] = [
    {
      id: 'actions', header: 'Actions', pinLeft: true, width: '4rem', excludeFromExport: true,
      cell: (org) => <CommonIconButton aria-label={`View ${org.name}`} icon={<Eye size={15} />} onClick={() => navigate(`/admin/organizations/${org.id}`)} />,
    },
    {
      id: 'name', header: 'Customer', width: '16rem', value: (org) => org.name,
      cell: (org) => (
        <Link to={`/admin/organizations/${org.id}`} className="block min-w-0 hover:underline" onClick={(event) => event.stopPropagation()}>
          <span className="block truncate font-bold text-[var(--text-primary)]">{org.name}</span>
          <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">{org.primaryContact}</span>
        </Link>
      ),
    },
    { id: 'code', header: 'Code', value: (org) => org.code, cell: (org) => <span className="font-mono text-xs text-[var(--text-secondary)]">{org.code}</span> },
    { id: 'email', header: 'Email', value: (org) => org.contactEmail, cell: (org) => <span className="text-[var(--text-secondary)]">{org.contactEmail}</span> },
    { id: 'users', header: 'Users', value: (org) => userCountFor(org.id), cell: (org) => <span className="text-[var(--text-secondary)]">{userCountFor(org.id)}</span> },
    { id: 'start', header: 'Start date', value: (org) => org.createdAt, cell: (org) => <span className="text-[var(--text-muted)]">{formatDate(org.createdAt)}</span> },
    { id: 'expiry', header: 'Expiry date', value: (org) => org.expiryDate, cell: (org) => <span className="text-[var(--text-muted)]">{formatDate(org.expiryDate)}</span> },
    {
      id: 'status', header: 'Status', value: (org) => (accessStatusOf(org.expiryDate) === 'expired' ? 'expired' : org.status),
      cell: (org) => (accessStatusOf(org.expiryDate) === 'expired' ? <StatusBadge status="expired" kind="access" /> : <StatusBadge status={org.status} kind="organization" />),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
        <InputField
          label="Search customers"
          hideLabel
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, code, or contact"
          startIcon={<Search size={13} />}
          className="min-h-8 text-xs placeholder:text-xs"
          wrapperClassName="min-w-[200px] max-w-xs shrink-0"
        />
        <div className="flex shrink-0 flex-nowrap gap-1.5">
          {ACCOUNT_STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setAccountFilter(filter.id)}
              className={`admin-filter-chip ${accountFilter === filter.id ? 'admin-filter-chip--active' : ''}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="w-40 shrink-0">
          <Dropdown
            label="Access status" hideLabel searchable={false} clearable={false}
            value={expiryFilter}
            onValueChange={(value) => setExpiryFilter((value as CustomerAccessStatus | 'all') ?? 'all')}
            options={[{ id: 'all', value: 'All access states' }, { id: 'active', value: 'Active' }, { id: 'expiring-soon', value: 'Expiring soon' }, { id: 'expired', value: 'Expired' }]}
            className="min-h-8"
          />
        </div>
        <div className="w-40 shrink-0">
          <Dropdown
            label="Sort by" hideLabel searchable={false} clearable={false}
            value={sortBy}
            onValueChange={(value) => setSortBy((value as SortOption) ?? 'name')}
            options={SORT_OPTIONS.map((option) => ({ id: option.id, value: option.label }))}
            className="min-h-8"
          />
        </div>
      </div>

      {customers.length === 0 ? (
        <EmptyState icon="🏢" title="No customers found" description="Try a different search term or filter combination." />
      ) : (
        <DataTable
          data={customers}
          columns={columns}
          getRowId={(org) => org.id}
          onRowClick={(org) => navigate(`/admin/organizations/${org.id}`)}
          exportFileName={`${app.shortName}-customers`}
          exportTitle={`${app.name} — Customers`}
          emptyMessage="No customers found."
        />
      )}
    </div>
  );
}
