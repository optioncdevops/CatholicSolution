import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '@app/components/Badge';
import { Dropdown } from '@app/components/formControls';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate, formatDateTime, formatDaysLabel, daysSince, daysUntil, effectiveInvoiceStatus } from '../utils/formatDate';
import { InvoiceDetailDrawer } from './InvoiceDetailDrawer';
import type { AdminApplication, Invoice, InvoiceStatus } from '../types';

/** No "Cancelled" chip here — cancelled invoices stay visible in the "All statuses" total and
 * in the table, but are filtered/reviewed from Invoice History, not this active-invoices tab. */
const STATUS_FILTERS: Array<{ id: InvoiceStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' },
  { id: 'created', label: 'Created' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'expiring-soon', label: 'Expiring soon' },
];

type DateRange = '30d' | '90d' | '180d' | 'all';
const RANGE_LABELS: Record<DateRange, string> = { '30d': 'Last 30 Days', '90d': 'Last 90 Days', '180d': 'Last 180 Days', all: 'All Time' };
const RANGE_DAYS: Partial<Record<DateRange, number>> = { '30d': 30, '90d': 90, '180d': 180 };

export function ProductInvoiceDetailsTab({ app }: { app: AdminApplication }) {
  const navigate = useNavigate();
  const { invoices, getOrganization } = useAdminData();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [range, setRange] = useState<DateRange>('all');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const rangedInvoices = useMemo(() => {
    const limit = RANGE_DAYS[range];
    return invoices
      .filter((invoice) => invoice.appId === app.id)
      .filter((invoice) => limit === undefined || daysSince(invoice.invoiceDate) <= limit);
  }, [invoices, app.id, range]);

  const rows = useMemo(() => rangedInvoices
    .filter((invoice) => statusFilter === 'all' || effectiveInvoiceStatus(invoice.status, invoice.dueDate) === statusFilter)
    .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate)),
  [rangedInvoices, statusFilter]);

  const columns: DataTableColumn<Invoice>[] = [
    {
      id: 'actions', header: 'Actions', pinLeft: true, width: '4rem', excludeFromExport: true,
      cell: (invoice) => <CommonIconButton aria-label={`View invoice ${invoice.invoiceNumber}`} icon={<Eye size={15} />} onClick={() => setViewingInvoice(invoice)} />,
    },
    { id: 'customerCode', header: 'Customer Code', value: (invoice) => getOrganization(invoice.orgId)?.code ?? '', cell: (invoice) => <span className="font-mono text-xs text-[var(--text-secondary)]">{getOrganization(invoice.orgId)?.code ?? '—'}</span> },
    { id: 'customer', header: 'Customer', width: '12rem', value: (invoice) => getOrganization(invoice.orgId)?.name ?? invoice.orgId, cell: (invoice) => <span className="font-bold text-[var(--text-primary)]">{getOrganization(invoice.orgId)?.name ?? invoice.orgId}</span> },
    { id: 'invoiceNumber', header: 'Invoice #', value: (invoice) => invoice.invoiceNumber, cell: (invoice) => <span className="font-mono text-xs text-[var(--text-secondary)]">{invoice.invoiceNumber}</span> },
    { id: 'invoiceDate', header: 'Invoice Date', value: (invoice) => invoice.invoiceDate, cell: (invoice) => <span className="text-[var(--text-muted)]">{formatDate(invoice.invoiceDate)}</span> },
    { id: 'dueDate', header: 'Due Date', value: (invoice) => invoice.dueDate, cell: (invoice) => <span className="text-[var(--text-muted)]">{formatDate(invoice.dueDate)}</span> },
    {
      id: 'days', header: 'Days', value: (invoice) => invoice.dueDate,
      cell: (invoice) => (
        <span className={invoice.status !== 'paid' && invoice.status !== 'cancelled' && daysUntil(invoice.dueDate) < 0 ? 'font-bold text-[var(--error)]' : 'text-[var(--text-muted)]'}>
          {invoice.status === 'paid' || invoice.status === 'cancelled' ? '—' : formatDaysLabel(invoice.dueDate)}
        </span>
      ),
    },
    { id: 'amount', header: 'Unit Amount', value: (invoice) => invoice.amount, cell: (invoice) => <span className="text-[var(--text-secondary)]">${invoice.amount.toFixed(2)}</span> },
    { id: 'quantity', header: 'Qty', value: (invoice) => invoice.quantity, cell: (invoice) => <span className="text-[var(--text-secondary)]">{invoice.quantity}</span> },
    { id: 'total', header: 'Total', value: (invoice) => invoice.amount * invoice.quantity, cell: (invoice) => <span className="font-bold text-[var(--text-primary)]">${(invoice.amount * invoice.quantity).toFixed(2)}</span> },
    { id: 'paidDate', header: 'Paid On', value: (invoice) => invoice.paidDate ?? '', cell: (invoice) => <span className="text-[var(--text-muted)]">{invoice.paidDate ? formatDateTime(invoice.paidDate) : '—'}</span> },
    { id: 'status', header: 'Status', value: (invoice) => effectiveInvoiceStatus(invoice.status, invoice.dueDate), cell: (invoice) => <StatusBadge status={effectiveInvoiceStatus(invoice.status, invoice.dueDate)} kind="invoice" /> },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[var(--text-muted)]">{rows.length} invoice{rows.length === 1 ? '' : 's'}</p>
        <div className="flex items-center gap-2">
          <div className="w-40 shrink-0">
            <Dropdown
              label="Date range" hideLabel searchable={false} clearable={false}
              value={range}
              onValueChange={(value) => setRange((value as DateRange) ?? 'all')}
              options={(Object.keys(RANGE_LABELS) as DateRange[]).map((option) => ({ id: option, value: RANGE_LABELS[option] }))}
              className="min-h-8"
            />
          </div>
          <CommonButton variant="primary" iconLeft={<Plus size={14} />} onClick={() => navigate(`/admin/applications/${app.id}/invoices/create`)}>Create Invoice</CommonButton>
        </div>
      </div>

      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
        {STATUS_FILTERS.map((filter) => {
          const count = filter.id === 'all' ? rangedInvoices.length : rangedInvoices.filter((invoice) => effectiveInvoiceStatus(invoice.status, invoice.dueDate) === filter.id).length;
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
        <EmptyState icon="🧾" title="No invoices found" description="Try a different search term, status, or date range." />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(invoice) => invoice.id}
          exportFileName={`${app.shortName}-invoices`}
          exportTitle={`${app.name} — Invoices`}
          emptyMessage="No invoices found."
        />
      )}

      <InvoiceDetailDrawer invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
    </div>
  );
}
