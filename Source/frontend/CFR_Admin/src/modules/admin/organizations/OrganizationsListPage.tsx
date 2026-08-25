import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '@app/components/Badge';
import { EntityAvatar } from '@app/components/EntityAvatar';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDateTime } from '../utils/formatDate';
import { OrganizationFormModal, type NewOrganizationValue } from './OrganizationFormModal';
import type { Organization, OrganizationStatus } from '../types';

const STATUS_FILTERS: Array<{ id: OrganizationStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' }, { id: 'active', label: 'Active' }, { id: 'trial', label: 'Trial' }, { id: 'suspended', label: 'Suspended' },
];

export function OrganizationsListPage() {
  const { organizations, users, addOrganization } = useAdminData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<OrganizationStatus | 'all'>('all');
  const [addOpen, setAddOpen] = useState(false);

  const rows = useMemo(() => organizations
    .filter((org) => statusFilter === 'all' || org.status === statusFilter),
  [organizations, statusFilter]);

  const userCount = (orgId: string) => users.filter((user) => user.orgId === orgId).length;

  const handleCreate = (value: NewOrganizationValue) => {
    addOrganization(value);
    setAddOpen(false);
    showToast(`${value.name} added ✓ (prototype only, not persisted)`);
  };

  const columns: DataTableColumn<Organization>[] = [
    {
      id: 'name', header: 'Organization', pinLeft: true, width: '14rem',
      value: (org) => org.name,
      cell: (org) => (
        <Link to={`/admin/organizations/${org.id}`} className="flex items-center gap-2.5 font-bold text-[var(--text-primary)] hover:underline">
          <EntityAvatar name={org.name} />
          <span>{org.name}</span>
        </Link>
      ),
    },
    {
      id: 'website', header: 'Website', width: '12rem', value: (org) => org.domain,
      cell: (org) => <a href={`https://${org.domain}`} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline" onClick={(event) => event.stopPropagation()}>{org.domain}</a>,
    },
    { id: 'primaryContact', header: 'Contact Person', value: (org) => org.primaryContact, cell: (org) => <span className="text-[var(--text-secondary)]">{org.primaryContact}</span> },
    { id: 'contactPhone', header: 'Contact Number', value: (org) => org.contactPhone, cell: (org) => <span className="text-[var(--text-secondary)]">{org.contactPhone}</span> },
    { id: 'status', header: 'Status', value: (org) => org.status, cell: (org) => <StatusBadge status={org.status} kind="organization" /> },
    { id: 'users', header: 'Users', value: (org) => userCount(org.id), cell: (org) => <span className="text-[var(--text-secondary)]">{userCount(org.id)}</span> },
    { id: 'apps', header: 'Products', value: (org) => org.appIds.length, cell: (org) => <span className="text-[var(--text-secondary)]">{org.appIds.length}</span> },
    { id: 'createdAt', header: 'Created On', value: (org) => org.createdAt, cell: (org) => <span className="text-[var(--text-muted)]">{formatDateTime(org.createdAt)}</span> },
  ];

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Organizations"
        action={<CommonButton variant="headerSecondary" iconLeft={<Plus size={14} />} onClick={() => setAddOpen(true)}>Add Organization</CommonButton>}
      />

      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
        {STATUS_FILTERS.map((filter) => {
          const count = filter.id === 'all' ? organizations.length : organizations.filter((org) => org.status === filter.id).length;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`admin-filter-chip ${statusFilter === filter.id ? 'admin-filter-chip--active' : ''}`}
            >
              {filter.label} ({count})
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="🏢" title="No organizations found" description="Try a different status filter." />
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

      <OrganizationFormModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreate} />
    </div>
  );
}
