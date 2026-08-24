import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '@app/components/Badge';
import { EntityAvatar } from '@app/components/EntityAvatar';
import { InputField } from '@app/components/formControls';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate } from '../utils/formatDate';
import type { Organization, OrganizationStatus } from '../types';

const STATUS_FILTERS: Array<{ id: OrganizationStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' }, { id: 'active', label: 'Active' }, { id: 'trial', label: 'Trial' }, { id: 'suspended', label: 'Suspended' },
];

export function OrganizationsListPage() {
  const { organizations, users } = useAdminData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrganizationStatus | 'all'>('all');

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return organizations
      .filter((org) => statusFilter === 'all' || org.status === statusFilter)
      .filter((org) => !normalized || [org.name, org.domain].join(' ').toLowerCase().includes(normalized));
  }, [organizations, query, statusFilter]);

  const userCount = (orgId: string) => users.filter((user) => user.orgId === orgId).length;

  const columns: DataTableColumn<Organization>[] = [
    {
      id: 'name', header: 'Organization', pinLeft: true, width: '16rem',
      value: (org) => `${org.name} (${org.domain})`,
      cell: (org) => (
        <Link to={`/admin/organizations/${org.id}`} className="flex items-center gap-2.5 font-bold text-[var(--text-primary)] hover:underline">
          <EntityAvatar name={org.name} />
          <span>
            <span className="block">{org.name}</span>
            <span className="block text-xs font-semibold text-[var(--text-muted)]">{org.domain}</span>
          </span>
        </Link>
      ),
    },
    { id: 'plan', header: 'Plan', value: (org) => org.plan, cell: (org) => <span className="capitalize text-[var(--text-secondary)]">{org.plan}</span> },
    { id: 'status', header: 'Status', value: (org) => org.status, cell: (org) => <StatusBadge status={org.status} kind="organization" /> },
    { id: 'users', header: 'Users', value: (org) => userCount(org.id), cell: (org) => <span className="text-[var(--text-secondary)]">{userCount(org.id)}</span> },
    { id: 'apps', header: 'Products', value: (org) => org.appIds.length, cell: (org) => <span className="text-[var(--text-secondary)]">{org.appIds.length}</span> },
    { id: 'createdAt', header: 'Created', value: (org) => org.createdAt, cell: (org) => <span className="text-[var(--text-muted)]">{formatDate(org.createdAt)}</span> },
  ];

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Organizations" />

      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
        <InputField
          label="Search organizations"
          hideLabel
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or domain"
          startIcon={<Search size={13} />}
          className="min-h-8 text-xs placeholder:text-xs"
          wrapperClassName="min-w-[200px] max-w-xs shrink-0"
        />
        <div className="flex shrink-0 flex-nowrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`admin-filter-chip ${statusFilter === filter.id ? 'admin-filter-chip--active' : ''}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="🏢" title="No organizations found" description="Try a different search term or status filter." />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(org) => org.id}
          onRowClick={(org) => navigate(`/admin/organizations/${org.id}`)}
          exportFileName="catholic-solutions-organizations"
          exportTitle="Catholic Solutions — Organizations"
          emptyMessage="No organizations found."
        />
      )}
    </div>
  );
}
