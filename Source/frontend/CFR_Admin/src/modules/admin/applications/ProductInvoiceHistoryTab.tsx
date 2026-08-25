import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { CommonIconButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '@app/components/Badge';
import { Dropdown } from '@app/components/formControls';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate, formatDateTime, effectiveInvoiceStatus } from '../utils/formatDate';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import type { AdminApplication, Invoice } from '../types';

const PAID_FILTERS = [
  { id: 'all', label: 'Paid & Unpaid' },
  { id: 'paid', label: 'Paid Only' },
  { id: 'unpaid', label: 'Unpaid Only' },
] as const;
type PaidFilter = (typeof PAID_FILTERS)[number]['id'];

/** Same grid layout as ProductInvoiceDetailsTab — this tab is just that data scoped to older,
 * historical invoices (any customer/paid-state, not limited to a rolling date range). */
export function ProductInvoiceHistoryTab({ app }: { app: AdminApplication }) {
  const { invoices, organizations, getOrganization } = useAdminData();
  const [customerFilter, setCustomerFilter] = useState('all');
  const [paidFilter, setPaidFilter] = useState<PaidFilter>('all');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const productCustomers = organizations.filter((org) => org.appIds.includes(app.id));

  const rows = useMemo(() => invoices
    .filter((invoice) => invoice.appId === app.id)
    .filter((invoice) => customerFilter === 'all' || invoice.orgId === customerFilter)
    .filter((invoice) => paidFilter === 'all' || (paidFilter === 'paid' ? Boolean(invoice.paidDate) : !invoice.paidDate))
    .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate)),
  [invoices, app.id, customerFilter, paidFilter]);

  const columns: DataTableColumn<Invoice>[] = [
    {
      id: 'actions', header: 'Actions', pinLeft: true, width: '4rem', excludeFromExport: true,
      cell: (invoice) => <CommonIconButton aria-label={`View invoice ${invoice.invoiceNumber}`} tooltip="View" icon={<Eye size={15} />} onClick={() => setViewingInvoice(invoice)} />,
    },
    { id: 'customerCode', header: 'Customer Code', value: (invoice) => getOrganization(invoice.orgId)?.code ?? '', cell: (invoice) => <span className="font-mono text-xs text-[var(--text-secondary)]">{getOrganization(invoice.orgId)?.code ?? '—'}</span> },
    { id: 'customer', header: 'Customer', width: '12rem', value: (invoice) => getOrganization(invoice.orgId)?.name ?? invoice.orgId, cell: (invoice) => <span className="font-bold text-[var(--text-primary)]">{getOrganization(invoice.orgId)?.name ?? invoice.orgId}</span> },
    { id: 'invoiceNumber', header: 'Invoice #', value: (invoice) => invoice.invoiceNumber, cell: (invoice) => <span className="font-mono text-xs text-[var(--text-secondary)]">{invoice.invoiceNumber}</span> },
    { id: 'invoiceDate', header: 'Invoice Date', value: (invoice) => invoice.invoiceDate, cell: (invoice) => <span className="text-[var(--text-muted)]">{formatDate(invoice.invoiceDate)}</span> },
    { id: 'dueDate', header: 'Due Date', value: (invoice) => invoice.dueDate, cell: (invoice) => <span className="text-[var(--text-muted)]">{formatDate(invoice.dueDate)}</span> },
    { id: 'paidDate', header: 'Paid On', value: (invoice) => invoice.paidDate ?? '', cell: (invoice) => <span className="text-[var(--text-muted)]">{invoice.paidDate ? formatDateTime(invoice.paidDate) : 'Not paid yet'}</span> },
    { id: 'total', header: 'Total', value: (invoice) => invoice.amount * invoice.quantity, cell: (invoice) => <span className="font-bold text-[var(--text-primary)]">${(invoice.amount * invoice.quantity).toFixed(2)}</span> },
    { id: 'status', header: 'Status', value: (invoice) => effectiveInvoiceStatus(invoice.status, invoice.dueDate), cell: (invoice) => <StatusBadge status={effectiveInvoiceStatus(invoice.status, invoice.dueDate)} kind="invoice" /> },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
        <div className="w-48 shrink-0">
          <Dropdown
            label="Customer" hideLabel searchable={false} clearable={false}
            value={customerFilter}
            onValueChange={(value) => setCustomerFilter(value ?? 'all')}
            options={[{ id: 'all', value: 'All Customers' }, ...productCustomers.map((org) => ({ id: org.id, value: org.name }))]}
            className="min-h-8"
          />
        </div>
        <div className="w-40 shrink-0">
          <Dropdown
            label="Paid state" hideLabel searchable={false} clearable={false}
            value={paidFilter}
            onValueChange={(value) => setPaidFilter((value as PaidFilter) ?? 'all')}
            options={PAID_FILTERS.map((option) => ({ id: option.id, value: option.label }))}
            className="min-h-8"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="🕒" title="No invoice history" description="Try a different customer or paid-state filter." />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(invoice) => invoice.id}
          exportFileName={`${app.shortName}-invoice-history`}
          exportTitle={`${app.name} — Invoice history`}
          emptyMessage="No invoice history."
        />
      )}

      <InvoiceDetailModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
    </div>
  );
}
