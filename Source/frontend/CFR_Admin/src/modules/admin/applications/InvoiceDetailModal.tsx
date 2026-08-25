import { BaseModal } from '@app/components/modal/BaseModal';
import { DetailField } from '@app/components/DetailField';
import { StatusBadge } from '@app/components/Badge';
import { formatDate, formatDateTime, formatDaysLabel, effectiveInvoiceStatus } from '../utils/formatDate';
import { useAdminData } from '../AdminDataContext';
import type { Invoice } from '../types';

export function InvoiceDetailModal({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  const { getOrganization, getApplication } = useAdminData();
  if (!invoice) return null;

  const org = getOrganization(invoice.orgId);
  const app = getApplication(invoice.appId);

  return (
    <BaseModal isOpen={Boolean(invoice)} onClose={onClose} title={invoice.title || invoice.invoiceNumber} size="md">
      <div className="flex flex-col gap-4">
        {org?.name ? <p className="-mt-2 text-xs text-[var(--text-muted)]">{org.name}</p> : null}
        <div className="flex items-center gap-2">
          <StatusBadge status={effectiveInvoiceStatus(invoice.status, invoice.dueDate)} kind="invoice" />
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
          <DetailField label="Paid on" value={invoice.paidDate ? formatDateTime(invoice.paidDate) : 'Not paid'} />
          <DetailField label="Amount" value={`$${invoice.amount.toFixed(2)}`} />
          {invoice.paymentLink ? (
            <div className="col-span-2">
              <DetailField label="Payment link" value={invoice.paymentLink} />
            </div>
          ) : null}
        </div>
        {invoice.customMessage ? (
          <div className="rounded-[var(--radius-panel)] border border-[var(--line-soft)] bg-[var(--surface-muted)] p-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Message to Customer</p>
            <div className="text-sm text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: invoice.customMessage }} />
          </div>
        ) : null}
        <p className="text-xs text-[var(--text-faint)]">Preview only — this prototype has no real billing system or PDF generation.</p>
      </div>
    </BaseModal>
  );
}
