import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { SearchIcon } from '@shared/app/components/UiIcons';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '../components/Badge';
import { EntityAvatar } from '../components/EntityAvatar';
import type { OrganizationStatus } from '../types';

const STATUS_FILTERS: Array<{ id: OrganizationStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'trial', label: 'Trial' }, { id: 'suspended', label: 'Suspended' },
];

export function OrganizationsListPage() {
  const { organizations, users } = useAdminData();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrganizationStatus | 'all'>('all');

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return organizations
      .filter((org) => statusFilter === 'all' || org.status === statusFilter)
      .filter((org) => !normalized || [org.name, org.domain].join(' ').toLowerCase().includes(normalized));
  }, [organizations, query, statusFilter]);

  const userCount = (orgId: string) => users.filter((user) => user.orgId === orgId).length;

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Organizations" description={`${organizations.length} organizations using Catholic Solutions.`} />

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="sr-only">Search organizations</span>
          <SearchIcon size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or domain"
            className="w-full rounded-[var(--radius-control)] border border-[var(--line)] py-2 pl-8 pr-3 text-[0.8125rem] outline-none focus:border-[var(--secondary)]"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                statusFilter === filter.id ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--line)] text-[var(--text-secondary)] hover:bg-[var(--hover)]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="🏢" title="No organizations found" description="Try a different search term or status filter." />
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th>Organization</th><th>Plan</th><th>Status</th><th>Users</th><th>Applications</th><th>Created</th></tr></thead>
            <tbody>
              {rows.map((org) => (
                <tr key={org.id}>
                  <td>
                    <Link to={`/admin/organizations/${org.id}`} className="flex items-center gap-2.5 font-bold text-[var(--text-primary)] hover:underline">
                      <EntityAvatar name={org.name} />
                      <span>
                        <span className="block">{org.name}</span>
                        <span className="block text-xs font-semibold text-[var(--text-muted)]">{org.domain}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="capitalize text-[var(--text-secondary)]">{org.plan}</td>
                  <td><StatusBadge status={org.status} kind="organization" /></td>
                  <td className="text-[var(--text-secondary)]">{userCount(org.id)}</td>
                  <td className="text-[var(--text-secondary)]">{org.appIds.length}</td>
                  <td className="text-[var(--text-muted)]">{org.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
