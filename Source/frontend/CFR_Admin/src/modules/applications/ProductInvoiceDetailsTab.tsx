import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { StatusBadge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate, effectiveLicenseStatus } from '../utils/formatDate';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import type { AdminApplication, EffectiveLicenseStatus, License } from '../types';

const STATUS_FILTERS: Array<{ id: EffectiveLicenseStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'expiring-soon', label: 'Expiring soon' },
  { id: 'expired', label: 'Expired' },
  { id: 'suspended', label: 'Suspended' },
];

export function ProductInvoiceDetailsTab({ app }: { app: AdminApplication }) {
  const navigate = useNavigate();
  const { licenses, getOrganization } = useAdminData();
  const [statusFilter, setStatusFilter] = useState<EffectiveLicenseStatus | 'all'>('all');
  const [viewingInvoice, setViewingInvoice] = useState<License | null>(null);

  // Only each customer's current license term — the one they're actually on right now.
  // Every prior/superseded term for the same customer still exists, but is reviewed from
  // License History instead of cluttering this "what's active today" view.
  const productLicenses = useMemo(() => {
    const currentByOrg = new Map<string, License>();
    for (const license of licenses) {
      if (license.appId !== app.id) continue;
      const existing = currentByOrg.get(license.orgId);
      if (!existing || license.startDate > existing.startDate) currentByOrg.set(license.orgId, license);
    }
    return [...currentByOrg.values()];
  }, [licenses, app.id]);

  const rows = useMemo(() => productLicenses
    .filter((license) => statusFilter === 'all' || effectiveLicenseStatus(license.status, license.expiryDate) === statusFilter)
    .sort((a, b) => b.startDate.localeCompare(a.startDate)),
  [productLicenses, statusFilter]);

  const columns: DataTableColumn<License>[] = [
    {
      id: 'actions', header: 'Actions', pinLeft: true, width: '4rem', excludeFromExport: true,
      cell: (license) => <CommonIconButton aria-label={`View license ${license.licenseNumber}`} tooltip="View" icon={<Eye size={15} />} onClick={() => setViewingInvoice(license)} />,
    },
    { id: 'customerCode', header: 'Customer Code', value: (license) => getOrganization(license.orgId)?.code ?? '', cell: (license) => <span className="font-mono text-xs text-[var(--text-secondary)]">{getOrganization(license.orgId)?.code ?? '—'}</span> },
    { id: 'customer', header: 'Customer', width: '12rem', value: (license) => getOrganization(license.orgId)?.name ?? license.orgId, cell: (license) => <span className="font-bold text-[var(--text-primary)]">{getOrganization(license.orgId)?.name ?? license.orgId}</span> },
    { id: 'licenseNumber', header: 'License #', value: (license) => license.licenseNumber, cell: (license) => <span className="font-mono text-xs text-[var(--text-secondary)]">{license.licenseNumber}</span> },
    { id: 'startDate', header: 'Start Date', value: (license) => license.startDate, cell: (license) => <span className="text-[var(--text-muted)]">{formatDate(license.startDate)}</span> },
    { id: 'expiryDate', header: 'Expiry Date', value: (license) => license.expiryDate, cell: (license) => <span className="text-[var(--text-muted)]">{formatDate(license.expiryDate)}</span> },
    { id: 'status', header: 'Status', value: (license) => effectiveLicenseStatus(license.status, license.expiryDate), cell: (license) => <StatusBadge status={effectiveLicenseStatus(license.status, license.expiryDate)} kind="license" /> },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[var(--text-muted)]">{rows.length} license{rows.length === 1 ? '' : 's'}</p>
        <CommonButton variant="primary" iconLeft={<Plus size={14} />} onClick={() => navigate(`/admin/applications/${app.id}/invoices/create`)}>Create License</CommonButton>
      </div>

      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
        {STATUS_FILTERS.map((filter) => {
          const count = filter.id === 'all' ? productLicenses.length : productLicenses.filter((license) => effectiveLicenseStatus(license.status, license.expiryDate) === filter.id).length;
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
        <EmptyState icon="🔑" title="No licenses found" description="Try a different status filter." />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(license) => license.id}
          exportFileName={`${app.shortName}-licenses`}
          exportTitle={`${app.name} — Licenses`}
          emptyMessage="No licenses found."
        />
      )}

      <InvoiceDetailModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
    </div>
  );
}
