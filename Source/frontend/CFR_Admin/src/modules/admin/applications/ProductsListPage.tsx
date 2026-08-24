import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Building2, Eye, Pencil, RefreshCw, Search } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonIconButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '@app/components/Badge';
import { InputField, Dropdown } from '@app/components/formControls';
import { formatDate } from '../utils/formatDate';
import { getProductWarnings } from './productValidation';
import { ProductStatusDialog } from './ProductStatusDialog';
import type { AdminApplication, ProductStatus } from '../types';

/** Quick-filter chips — the full status set (including On Request / Archived) is still
 * reachable via "All statuses"; these are just the most common day-to-day filters. */
const STATUS_FILTERS: Array<{ id: ProductStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'coming-soon', label: 'Coming soon' },
];

const SORT_OPTIONS = [
  { id: 'updated', label: 'Recently updated' },
  { id: 'name', label: 'Name (A–Z)' },
  { id: 'customers', label: 'Most customers' },
] as const;
type SortOption = (typeof SORT_OPTIONS)[number]['id'];

export function ProductsListPage() {
  const { applications, organizations, setApplicationStatus } = useAdminData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [simulatedError, setSimulatedError] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated');

  const [statusApp, setStatusApp] = useState<AdminApplication | null>(null);
  const [pendingStatus, setPendingStatus] = useState<ProductStatus | null>(null);

  useEffect(() => {
    // Simulates the initial fetch a real product list would perform.
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const customersForApp = useCallback(
    (app: AdminApplication) => organizations.filter((org) => org.appIds.includes(app.id)),
    [organizations],
  );

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = applications
      .filter((app) => statusFilter === 'all' || app.status === statusFilter)
      .filter((app) => !normalized || [app.id, app.name, app.category, app.productionUrl].join(' ').toLowerCase().includes(normalized));

    const sorted = [...filtered];
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'customers') sorted.sort((a, b) => customersForApp(b).length - customersForApp(a).length);
    else sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return sorted;
  }, [applications, query, statusFilter, sortBy, customersForApp]);

  const handleConfirmStatus = (status: ProductStatus) => {
    if (!statusApp) return;
    setApplicationStatus(statusApp.id, status);
    showToast(`${statusApp.name} status changed to ${status.replace('-', ' ')} ✓`);
    setStatusApp(null);
    setPendingStatus(null);
  };

  if (simulatedError) {
    return (
      <div className="admin-reveal flex flex-col gap-4">
        <PanelHeader title="Products" />
        <EmptyState
          icon="⚠️"
          title="Couldn't load products"
          description="Something went wrong loading the product registry. This is a simulated error state — this prototype has no real API to fail."
          actionLabel="Retry"
          onAction={() => { setSimulatedError(false); setLoading(true); setTimeout(() => setLoading(false), 300); }}
        />
      </div>
    );
  }

  return (
    <div className="admin-reveal flex flex-col gap-2.5">
      <PanelHeader title="Products" />

      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
        <InputField
          label="Search products"
          hideLabel
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, ID, category, domain"
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

        <div className="w-40 shrink-0">
          <Dropdown
            label="Sort by"
            hideLabel
            searchable={false}
            clearable={false}
            value={sortBy}
            onValueChange={(value) => setSortBy((value as SortOption) ?? 'updated')}
            options={SORT_OPTIONS.map((option) => ({ id: option.id, value: option.label }))}
            className="min-h-8"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading products">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="admin-skeleton h-36 w-full rounded-[var(--radius-panel)]" />)}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon="🗂️" title="No products found" description="Try a different search term or filter combination." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((app) => {
            const warnings = getProductWarnings(app, applications);
            const customerCount = customersForApp(app).length;
            return (
              <article key={app.id} className="admin-product-card relative">
                <div className="absolute right-[0.85rem] top-3">
                  <StatusBadge status={app.status} kind="application" />
                </div>

                <div className="flex items-center gap-2.5 pr-16">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg text-sm text-white" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
                  <div className="min-w-0">
                    <Link to={`/admin/applications/${app.id}`} className="flex items-center gap-1.5 hover:underline">
                      <span className="truncate text-sm font-extrabold text-[var(--text-primary)]">{app.name}</span>
                      {warnings.length > 0 ? (
                        <span title={`${warnings.length} data quality warning${warnings.length === 1 ? '' : 's'}`} aria-label={`${warnings.length} data quality warning${warnings.length === 1 ? '' : 's'}`}>
                          <AlertTriangle size={13} className="shrink-0 text-[var(--warning)]" />
                        </span>
                      ) : null}
                    </Link>
                    <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">{app.category}</span>
                  </div>
                </div>

                <p className="admin-product-card__description">{app.description || 'No description yet.'}</p>

                <div className="admin-product-card__divider" />

                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                  <Building2 size={13} className="text-[var(--text-faint)]" />
                  {customerCount} customer{customerCount === 1 ? '' : 's'}
                </span>

                <div className="admin-product-card__footer">
                  <span className="truncate text-xs font-semibold text-[var(--text-faint)]">Updated {formatDate(app.updatedAt)}</span>
                  <div className="flex items-center gap-0.5">
                    <CommonIconButton aria-label={`View ${app.name}`} icon={<Eye size={14} />} onClick={() => navigate(`/admin/applications/${app.id}`)} />
                    <CommonIconButton aria-label={`Edit ${app.name}`} icon={<Pencil size={14} />} onClick={() => navigate(`/admin/applications/${app.id}/edit`)} />
                    <CommonIconButton aria-label={`Change status for ${app.name}`} icon={<RefreshCw size={14} />} onClick={() => { setStatusApp(app); setPendingStatus(null); }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ProductStatusDialog
        app={statusApp}
        pendingStatus={pendingStatus}
        onSelectStatus={setPendingStatus}
        onClose={() => { setStatusApp(null); setPendingStatus(null); }}
        onConfirm={handleConfirmStatus}
      />
    </div>
  );
}
