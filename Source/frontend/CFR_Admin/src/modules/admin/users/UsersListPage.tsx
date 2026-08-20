import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { SearchIcon } from '@shared/app/components/UiIcons';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '../components/Badge';
import { EntityAvatar } from '../components/EntityAvatar';
import type { UserStatus } from '../types';

const STATUS_FILTERS: Array<{ id: UserStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'invited', label: 'Invited' }, { id: 'deactivated', label: 'Deactivated' },
];

export function UsersListPage() {
  const { users, getOrganization } = useAdminData();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users
      .filter((user) => statusFilter === 'all' || user.status === statusFilter)
      .filter((user) => !normalized || [user.name, user.email].join(' ').toLowerCase().includes(normalized));
  }, [users, query, statusFilter]);

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Users" description={`${users.length} users across all organizations.`} />

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="sr-only">Search users</span>
          <SearchIcon size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
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
        <EmptyState icon="🙍" title="No users found" description="Try a different search term or status filter." />
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th>User</th><th>Organization</th><th>Role</th><th>Status</th><th>App access</th><th>Last active</th></tr></thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Link to={`/admin/users/${user.id}`} className="flex items-center gap-2.5 font-bold text-[var(--text-primary)] hover:underline">
                      <EntityAvatar name={user.name} />
                      <span>
                        <span className="block">{user.name}</span>
                        <span className="block text-xs font-semibold text-[var(--text-muted)]">{user.email}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="text-[var(--text-secondary)]">{getOrganization(user.orgId)?.name ?? '—'}</td>
                  <td className="capitalize text-[var(--text-secondary)]">{user.role}</td>
                  <td><StatusBadge status={user.status} kind="user" /></td>
                  <td className="text-[var(--text-secondary)]">{user.appAccessIds.length}</td>
                  <td className="text-[var(--text-muted)]">{user.lastActiveAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
