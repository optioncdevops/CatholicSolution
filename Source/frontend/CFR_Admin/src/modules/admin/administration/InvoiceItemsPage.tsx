import { useMemo, useState } from 'react';
import { Pencil, Plus, Power, Search } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { Badge } from '@app/components/Badge';
import { InputField } from '@app/components/formControls';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { InvoiceItemFormDrawer, type InvoiceItemFormValue } from './InvoiceItemFormDrawer';
import type { InvoiceItem } from '../types';

const STATUS_FILTERS = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number]['id'];

export function InvoiceItemsPage() {
  const { invoiceItems, addInvoiceItem, updateInvoiceItem, toggleInvoiceItemActive } = useAdminData();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [drawerTarget, setDrawerTarget] = useState<'create' | InvoiceItem | null>(null);

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return invoiceItems
      .filter((item) => statusFilter === 'all' || (statusFilter === 'active') === item.active)
      .filter((item) => !normalized || [item.title, item.description].join(' ').toLowerCase().includes(normalized));
  }, [invoiceItems, query, statusFilter]);

  const handleToggle = (item: InvoiceItem) => {
    toggleInvoiceItemActive(item.id);
    showToast(`${item.title} ${item.active ? 'deactivated' : 'activated'} ✓`);
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
          <CommonIconButton aria-label={`Edit ${item.title}`} icon={<Pencil size={14} />} onClick={() => setDrawerTarget(item)} />
          <CommonIconButton aria-label={item.active ? `Deactivate ${item.title}` : `Activate ${item.title}`} variant={item.active ? 'danger' : 'ghost'} icon={<Power size={14} />} onClick={() => handleToggle(item)} />
        </div>
      ),
    },
    { id: 'title', header: 'Title', width: '14rem', value: (item) => item.title, cell: (item) => <span className="font-bold text-[var(--text-primary)]">{item.title}</span> },
    { id: 'defaultAmount', header: 'Default amount', value: (item) => item.defaultAmount, cell: (item) => <span className="font-bold text-[var(--text-primary)]">${item.defaultAmount.toFixed(2)}</span> },
    { id: 'description', header: 'Description', value: (item) => item.description, cell: (item) => <span className="text-[var(--text-secondary)]">{item.description}</span> },
    { id: 'status', header: 'Status', value: (item) => (item.active ? 'active' : 'inactive'), cell: (item) => <Badge tone={item.active ? 'success' : 'neutral'}>{item.active ? 'Active' : 'Inactive'}</Badge> },
  ];

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Invoice items"
        action={<CommonButton variant="primary" iconLeft={<Plus size={14} />} onClick={() => setDrawerTarget('create')}>Add new item</CommonButton>}
      />

      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
        <InputField
          label="Search invoice items"
          hideLabel
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title or description"
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
        <EmptyState icon="🧾" title="No invoice items found" description="Try a different search term or filter." />
      ) : (
        <DataTable data={rows} columns={columns} getRowId={(item) => item.id} exportFileName="invoice-items" exportTitle="Invoice items" emptyMessage="No invoice items found." />
      )}

      <InvoiceItemFormDrawer target={drawerTarget} onClose={() => setDrawerTarget(null)} onCreate={handleCreate} onSave={handleSave} />
    </div>
  );
}
