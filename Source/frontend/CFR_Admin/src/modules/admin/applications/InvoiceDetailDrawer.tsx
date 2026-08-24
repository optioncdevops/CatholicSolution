import { Drawer } from '@app/components/Drawer';
import { DetailField } from '@app/components/DetailField';
import { StatusBadge } from '@app/components/Badge';
import { formatDate, formatDaysLabel } from '../utils/formatDate';
import { useAdminData } from '../AdminDataContext';
import type { Invoice } from '../types';

export function InvoiceDetailDrawer({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  const { getOrganization, getApplication } = useAdminData();
  if (!invoice) return null;

  const org = getOrganization(invoice.orgId);
  const app = getApplication(invoice.appId);

  return (
    <Drawer open={Boolean(invoice)} title={invoice.invoiceNumber} description={org?.name} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <StatusBadge status={invoice.status} kind="invoice" />
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' ? (
            <span className="text-xs font-semibold text-[var(--text-muted)]">{formatDaysLabel(invoice.dueDate)}</span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DetailField label="Customer" value={org?.name ?? invoice.orgId} />
          <DetailField label="Customer code" value={org?.code ?? '—'} />
          <DetailField label="Product" value={app?.name ?? invoice.appId} />
          <DetailField label="Quantity" value={String(invoice.quantity)} />
          <DetailField label="Invoice date" value={formatDate(invoice.invoiceDate)} />
          <DetailField label="Due date" value={formatDate(invoice.dueDate)} />
          <DetailField label="Paid date" value={invoice.paidDate ? formatDate(invoice.paidDate) : 'Not paid'} />
          <DetailField label="Amount" value={`$${invoice.amount.toFixed(2)}`} />
        </div>
        <p className="text-xs text-[var(--text-faint)]">Preview only — this prototype has no real billing system or PDF generation.</p>
      </div>
    </Drawer>
  );
}
