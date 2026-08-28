import { useMemo, useState } from 'react';
import { Pencil, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { Badge } from '@app/components/Badge';
import { Dropdown } from '@app/components/formControls';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { confirmAction } from '../lib/confirm';
import { InvoiceItemFormModal, type InvoiceItemFormValue } from './InvoiceItemFormModal';
import type { InvoiceItem } from '../types';

const ALL_PRODUCTS_FILTER = 'all';

const STATUS_FILTERS = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number]['id'];

export function InvoiceItemsPage() {
  const { invoiceItems, applications, getApplication, addInvoiceItem, updateInvoiceItem, toggleInvoiceItemActive } = useAdminData();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [productFilter, setProductFilter] = useState(ALL_PRODUCTS_FILTER);
  const [drawerTarget, setDrawerTarget] = useState<'create' | InvoiceItem | null>(null);

  const rows = useMemo(() => invoiceItems
    .filter((item) => statusFilter === 'all' || (statusFilter === 'active') === item.active)
    .filter((item) => productFilter === ALL_PRODUCTS_FILTER || item.appId === productFilter),
  [invoiceItems, statusFilter, productFilter]);

  const handleToggle = async (item: InvoiceItem) => {
    if (!item.active) {
      toggleInvoiceItemActive(item.id);
      showToast(`${item.title} activated ✓`);
      return;
    }
    const confirmed = await confirmAction({
      title: 'Deactivate this item?',
      description: `"${item.title}" will no longer be available to add to new licenses.`,
      confirmLabel: 'Deactivate',
      tone: 'danger',
    });
    if (!confirmed) return;
    toggleInvoiceItemActive(item.id);
    showToast(`${item.title} deactivated`);
  };

  const handleCreate = (value: InvoiceItemFormValue) => {
    addInvoiceItem({ ...value, active: true });
    setDrawerTarget(null);
    showToast(`${value.title} added ✓`);
  };

  const handleSave = (item: InvoiceItem) => {
    updateInvoiceItem(item);
    setDrawerTarget(null);
    showToast(`${item.title} updated ✓`);
  };

  const columns: DataTableColumn<InvoiceItem>[] = [
    {
      id: 'actions', header: 'Actions', pinLeft: true, width: '5.5rem', excludeFromExport: true,
      cell: (item) => (
        <div className="flex items-center gap-0.5">
          <CommonIconButton aria-label={`Edit ${item.title}`} tooltip="Edit" icon={<Pencil size={14} />} onClick={() => setDrawerTarget(item)} />
          <CommonIconButton aria-label={item.active ? `Deactivate ${item.title}` : `Activate ${item.title}`} tooltip={item.active ? 'Deactivate' : 'Activate'} variant={item.active ? 'danger' : 'ghost'} icon={item.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />} onClick={() => void handleToggle(item)} />
        </div>
      ),
    },
    { id: 'title', header: 'Title', width: '14rem', value: (item) => item.title, cell: (item) => <span className="font-bold text-[var(--text-primary)]">{item.title}</span> },
    {
      id: 'product', header: 'Product', width: '11rem',
      value: (item) => getApplication(item.appId)?.name ?? item.appId,
      cell: (item) => <span className="text-[var(--text-secondary)]">{getApplication(item.appId)?.name ?? item.appId}</span>,
    },
    { id: 'defaultAmount', header: 'Default Amount', value: (item) => item.defaultAmount, cell: (item) => <span className="font-bold text-[var(--text-primary)]">${item.defaultAmount.toFixed(2)}</span> },
    { id: 'description', header: 'Description', value: (item) => item.description, cell: (item) => <span className="text-[var(--text-secondary)]">{item.description}</span> },
    { id: 'status', header: 'Status', value: (item) => (item.active ? 'active' : 'inactive'), cell: (item) => <Badge tone={item.active ? 'success' : 'neutral'}>{item.active ? 'Active' : 'Inactive'}</Badge> },
  ];

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="License Items"
        action={<CommonButton variant="headerSecondary" iconLeft={<Plus size={14} />} onClick={() => setDrawerTarget('create')}>Add New Item</CommonButton>}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
          {STATUS_FILTERS.map((filter) => {
            const count = filter.id === 'all' ? invoiceItems.length : invoiceItems.filter((item) => (filter.id === 'active') === item.active).length;
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
        <div className="w-52 shrink-0">
          <Dropdown
            label="Product" hideLabel searchable={false} clearable={false}
            value={productFilter}
            onValueChange={(value) => setProductFilter(value ?? ALL_PRODUCTS_FILTER)}
            options={[
              { id: ALL_PRODUCTS_FILTER, value: 'All Products' },
              ...applications.map((app) => ({ id: app.id, value: app.name })),
            ]}
            className="min-h-8"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="🧾" title="No license items found" description="Try a different search term or filter." />
      ) : (
        <DataTable data={rows} columns={columns} getRowId={(item) => item.id} exportFileName="license-items" exportTitle="License items" emptyMessage="No license items found." />
      )}

      <InvoiceItemFormModal target={drawerTarget} onClose={() => setDrawerTarget(null)} onCreate={handleCreate} onSave={handleSave} />
    </div>
  );
}
