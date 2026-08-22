import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Building2, Package, Pencil, RefreshCw, Search } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '../components/Badge';
import { EntityAvatar } from '../components/EntityAvatar';
import { IconButton } from '../components/form/Button';
import { InputField, Dropdown } from '../components/formControls';
import { formatDate } from '../utils/formatDate';
import { getProductWarnings } from './productValidation';
import { ProductEditDrawer } from './ProductEditDrawer';
import { ProductStatusDialog } from './ProductStatusDialog';
import type { AdminApplication, Organization, ProductStatus } from '../types';

const STATUS_FILTERS: Array<{ id: ProductStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'coming-soon', label: 'Coming Soon' },
  { id: 'on-request', label: 'On Request' },
  { id: 'archived', label: 'Archived' },
];

const SORT_OPTIONS = [
  { id: 'updated', label: 'Recently updated' },
  { id: 'name', label: 'Name (A–Z)' },
  { id: 'customers', label: 'Most customers' },
] as const;
type SortOption = (typeof SORT_OPTIONS)[number]['id'];

function CustomerStack({ customers }: { customers: Organization[] }) {
  if (customers.length === 0) {
    return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-faint)]"><Building2 size={13} /> No customers yet</span>;
  }
  const shown = customers.slice(0, 3);
  const remaining = customers.length - shown.length;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center" title={customers.map((org) => org.name).join(', ')}>
        {shown.map((org, index) => (
          <span key={org.id} className="admin-avatar-stack__item" style={{ zIndex: shown.length - index }}>
            <EntityAvatar name={org.name} size={22} />
          </span>
        ))}
        {remaining > 0 ? (
          <span className="admin-avatar-stack__item admin-avatar-stack__more">+{remaining}</span>
        ) : null}
      </div>
      <span className="text-xs font-semibold text-[var(--text-muted)]">
        {customers.length} customer{customers.length === 1 ? '' : 's'}
      </span>
    </div>
  );
}

export function ProductsListPage() {
  const { applications, organizations, updateApplication, setApplicationStatus } = useAdminData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [simulatedError, setSimulatedError] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated');

  const [editingApp, setEditingApp] = useState<AdminApplication | null>(null);
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

  const handleSave = (app: AdminApplication) => {
    updateApplication(app);
    setEditingApp(null);
    showToast(`${app.name} updated ✓`);
  };

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
        <PanelHeader title="Products" description="Manage the Catholic Solutions product registry." />
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
      <PanelHeader title="Products" icon={<Package size={16} />} />

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
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.6875rem] font-bold capitalize transition-colors ${
                statusFilter === filter.id ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--line)] text-[var(--text-secondary)] hover:bg-[var(--hover)]'
              }`}
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
            const customers = customersForApp(app);
            return (
              <article
                key={app.id}
                onClick={() => navigate(`/admin/applications/${app.id}`)}
                className="admin-product-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg text-sm text-white" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
                  <StatusBadge status={app.status} kind="application" />
                </div>

                <div className="mt-2 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-extrabold text-[var(--text-primary)]">{app.name}</span>
                    {warnings.length > 0 ? (
                      <span title={`${warnings.length} data quality warning${warnings.length === 1 ? '' : 's'}`} aria-label={`${warnings.length} data quality warning${warnings.length === 1 ? '' : 's'}`}>
                        <AlertTriangle size={13} className="shrink-0 text-[var(--warning)]" />
                      </span>
                    ) : null}
                  </span>
                  <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">{app.category}</span>
                </div>

                <p className="admin-product-card__description">{app.description || 'No description yet.'}</p>

                <div className="admin-product-card__divider" />

                <CustomerStack customers={customers} />

                <div className="admin-product-card__footer">
                  <span className="truncate text-xs font-semibold text-[var(--text-faint)]">Updated {formatDate(app.updatedAt)}</span>
                  <div className="flex items-center gap-0.5" onClick={(event) => event.stopPropagation()}>
                    <IconButton label={`Edit ${app.name}`} onClick={() => setEditingApp(app)}><Pencil size={14} /></IconButton>
                    <IconButton label={`Change status for ${app.name}`} onClick={() => { setStatusApp(app); setPendingStatus(null); }}><RefreshCw size={14} /></IconButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ProductEditDrawer app={editingApp} onClose={() => setEditingApp(null)} onSave={handleSave} />
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
