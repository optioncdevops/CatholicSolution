import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { CommonIconButton } from '@app/components/buttons';
import { useAdminData } from '@/modules/AdminDataContext';
import { StatusBadge } from '@app/components/Badge';
import { Dropdown } from '@app/components/formControls';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate, effectiveLicenseStatus } from '@/modules/utils/formatDate';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import type { AdminApplication, EffectiveLicenseStatus, License } from '@/modules/types';

const STATUS_FILTERS: Array<{ id: EffectiveLicenseStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'expiring-soon', label: 'Expiring soon' },
  { id: 'expired', label: 'Expired' },
  { id: 'suspended', label: 'Suspended' },
];

export function ProductInvoiceHistoryTab({ app }: { app: AdminApplication }) {
  const { licenses, organizations, getOrganization } = useAdminData();
  const [customerFilter, setCustomerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<EffectiveLicenseStatus | 'all'>('all');
  const [viewingInvoice, setViewingInvoice] = useState<License | null>(null);

  const productCustomers = organizations.filter((org) => org.appIds.includes(app.id));

  const currentLicenseIdByOrg = useMemo(() => {
    const currentByOrg = new Map<string, License>();
    for (const license of licenses) {
      if (license.appId !== app.id) continue;
      const existing = currentByOrg.get(license.orgId);
      if (!existing || license.startDate > existing.startDate) currentByOrg.set(license.orgId, license);
    }
    return new Map([...currentByOrg.entries()].map(([orgId, license]) => [orgId, license.id]));
  }, [licenses, app.id]);

  const rows = useMemo(() => licenses
    .filter((license) => license.appId === app.id)
    .filter((license) => customerFilter === 'all' || license.orgId === customerFilter)
    .filter((license) => statusFilter === 'all' || effectiveLicenseStatus(license.status, license.expiryDate) === statusFilter)
    .sort((a, b) => b.startDate.localeCompare(a.startDate)),
  [licenses, app.id, customerFilter, statusFilter]);

  const columns: DataTableColumn<License>[] = [
    {
      id: 'actions', header: 'Actions', pinLeft: true, width: '4rem', excludeFromExport: true,
      cell: (license) => <CommonIconButton aria-label={`View license ${license.licenseNumber}`} tooltip="View" icon={<Eye size={15} />} onClick={() => setViewingInvoice(license)} />,
    },
    {
      id: 'term', header: 'Term', width: '6rem',
      value: (license) => (currentLicenseIdByOrg.get(license.orgId) === license.id ? 'Current' : 'Past'),
      cell: (license) => (currentLicenseIdByOrg.get(license.orgId) === license.id
        ? <span className="font-bold text-[var(--success)]">Current</span>
        : <span className="text-[var(--text-faint)]">Past</span>),
    },
    { id: 'customerCode', header: 'Customer Code', value: (license) => getOrganization(license.orgId)?.code ?? '', cell: (license) => <span className="font-mono text-xs text-[var(--text-secondary)]">{getOrganization(license.orgId)?.code ?? '—'}</span> },
    { id: 'customer', header: 'Customer', width: '12rem', value: (license) => getOrganization(license.orgId)?.name ?? license.orgId, cell: (license) => <span className="font-bold text-[var(--text-primary)]">{getOrganization(license.orgId)?.name ?? license.orgId}</span> },
    { id: 'licenseNumber', header: 'License #', value: (license) => license.licenseNumber, cell: (license) => <span className="font-mono text-xs text-[var(--text-secondary)]">{license.licenseNumber}</span> },
    { id: 'licenseKey', header: 'License Key', width: '16rem', value: (license) => license.licenseKey, cell: (license) => <span className="font-mono text-xs text-[var(--text-secondary)]">{license.licenseKey}</span> },
    { id: 'seats', header: 'Seats', value: (license) => license.seats ?? 'Unlimited', cell: (license) => <span className="font-bold text-[var(--text-primary)]">{license.seats ?? 'Unlimited'}</span> },
    { id: 'startDate', header: 'Start Date', value: (license) => license.startDate, cell: (license) => <span className="text-[var(--text-muted)]">{formatDate(license.startDate)}</span> },
    { id: 'expiryDate', header: 'Expiry Date', value: (license) => license.expiryDate, cell: (license) => <span className="text-[var(--text-muted)]">{formatDate(license.expiryDate)}</span> },
    { id: 'status', header: 'Status', value: (license) => effectiveLicenseStatus(license.status, license.expiryDate), cell: (license) => <StatusBadge status={effectiveLicenseStatus(license.status, license.expiryDate)} kind="license" /> },
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
        <div className="w-44 shrink-0">
          <Dropdown
            label="Status" hideLabel searchable={false} clearable={false}
            value={statusFilter}
            onValueChange={(value) => setStatusFilter((value as EffectiveLicenseStatus | 'all') ?? 'all')}
            options={STATUS_FILTERS.map((filter) => ({ id: filter.id, value: filter.label }))}
            className="min-h-8"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="🕒" title="No license history" description="Try a different customer or status filter." />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(license) => license.id}
          exportFileName={`${app.shortName}-license-history`}
          exportTitle={`${app.name} — License history`}
          emptyMessage="No license history."
        />
      )}

      <InvoiceDetailModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
    </div>
  );
}
