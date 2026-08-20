import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { PlusIcon, SearchIcon } from '@shared/app/components/UiIcons';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '../components/Badge';
import type { ApplicationStatus } from '../types';

const STATUS_FILTERS: Array<{ id: ApplicationStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'on-request', label: 'On Request' },
  { id: 'coming-soon', label: 'Coming Soon' },
  { id: 'future', label: 'Future' },
];

export function ApplicationsListPage() {
  const { applications } = useAdminData();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<'name' | 'updatedAt'>('updatedAt');

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return applications
      .filter((app) => statusFilter === 'all' || app.status === statusFilter)
      .filter((app) => !normalized || [app.name, app.category, app.domain].join(' ').toLowerCase().includes(normalized))
      .sort((a, b) => (sortKey === 'name' ? a.name.localeCompare(b.name) : b.updatedAt.localeCompare(a.updatedAt)));
  }, [applications, query, statusFilter, sortKey]);

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Applications"
        description={`${applications.length} applications in the registry.`}
        action={(
          <Link to="/admin/applications/new" className="action-primary inline-flex items-center gap-1.5">
            <PlusIcon size={15} /> New application
          </Link>
        )}
      />

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="sr-only">Search applications</span>
          <SearchIcon size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, category, domain"
            className="w-full rounded-[var(--radius-control)] border border-[var(--line)] py-2 pl-8 pr-3 text-[0.8125rem] outline-none focus:border-[var(--secondary)]"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                statusFilter === filter.id
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                  : 'border-[var(--line)] text-[var(--text-secondary)] hover:bg-[var(--hover)]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <select
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value as 'name' | 'updatedAt')}
          aria-label="Sort applications"
          className="rounded-[var(--radius-control)] border border-[var(--line)] px-2.5 py-2 text-xs font-bold text-[var(--text-secondary)]"
        >
          <option value="updatedAt">Recently updated</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="🗂️" title="No applications found" description="Try a different search term or status filter." />
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Category</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Domain</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((app) => (
                <tr key={app.id}>
                  <td>
                    <Link to={`/admin/applications/${app.id}`} className="flex items-center gap-2.5 font-bold text-[var(--text-primary)] hover:underline">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg text-sm text-white" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
                      {app.name}
                    </Link>
                  </td>
                  <td className="text-[var(--text-secondary)]">{app.category}</td>
                  <td><StatusBadge status={app.status} kind="application" /></td>
                  <td className="capitalize text-[var(--text-secondary)]">{app.visibility}</td>
                  <td className="font-mono text-xs text-[var(--text-muted)]">{app.domain}</td>
                  <td className="text-[var(--text-muted)]">{app.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
