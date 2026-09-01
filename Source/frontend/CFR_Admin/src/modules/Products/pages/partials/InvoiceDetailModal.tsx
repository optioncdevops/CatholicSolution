import { BaseModal } from '@app/components/modal/BaseModal';
import { DetailField } from '@app/components/DetailField';
import { StatusBadge } from '@app/components/Badge';
import { formatDate, formatDaysLabel, effectiveLicenseStatus } from '@/modules/utils/formatDate';
import { useAdminData } from '@/modules/AdminDataContext';
import type { License } from '@/modules/types';

export function InvoiceDetailModal({ invoice, onClose }: { invoice: License | null; onClose: () => void }) {
  const { getOrganization, getApplication } = useAdminData();
  if (!invoice) return null;

  const org = getOrganization(invoice.orgId);
  const app = getApplication(invoice.appId);
  const status = effectiveLicenseStatus(invoice.status, invoice.expiryDate);

  return (
    <BaseModal isOpen={Boolean(invoice)} onClose={onClose} title={invoice.title || invoice.licenseNumber} size="md">
      <div className="flex flex-col gap-4">
        {org?.name ? <p className="-mt-2 text-xs text-[var(--text-muted)]">{org.name}</p> : null}
        <div className="flex items-center gap-2">
          <StatusBadge status={status} kind="license" />
          {status !== 'suspended' && status !== 'expired' ? (
            <span className="text-xs font-semibold text-[var(--text-muted)]">{formatDaysLabel(invoice.expiryDate)}</span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DetailField label="Customer" value={org?.name ?? invoice.orgId} />
          <DetailField label="Customer code" value={org?.code ?? '—'} />
          <DetailField label="Product" value={app?.name ?? invoice.appId} />
          <DetailField label="Start date" value={formatDate(invoice.startDate)} />
          <DetailField label="Expiry date" value={formatDate(invoice.expiryDate)} />
        </div>
        {invoice.customMessage ? (
          <div className="rounded-[var(--radius-panel)] border border-[var(--line-soft)] bg-[var(--surface-muted)] p-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Message to Customer</p>
            <div className="text-sm text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: invoice.customMessage }} />
          </div>
        ) : null}
        <p className="text-xs text-[var(--text-faint)]">Preview only — this prototype has no real license provisioning system.</p>
      </div>
    </BaseModal>
  );
}
