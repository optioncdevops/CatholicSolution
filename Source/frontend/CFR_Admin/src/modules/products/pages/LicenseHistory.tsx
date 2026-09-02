import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { CommonIconButton } from '@app/components/buttons';
import { useToast } from '@shared/app/components/ToastProvider';
import { StatusBadge } from '@app/components/Badge';
import { Dropdown } from '@app/components/formControls';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate } from '@/modules/utils/formatDate';
import { getLicenseDetails } from '../services/productService';
import type { ProductLicenseApiItem, ProductLicenseHistoryRow } from '../types/productTypes';
import { toLicenseHistoryRows } from '../utils/productHelpers';
import { InvoiceDetailModal } from './partials/InvoiceDetailModal';
import type { AdminApplication, EffectiveLicenseStatus, License } from '@/modules/types';

const STATUS_FILTERS: Array<{ id: EffectiveLicenseStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'expiring-soon', label: 'Expiring soon' },
  { id: 'expired', label: 'Expired' },
  { id: 'suspended', label: 'Suspended' },
];

export function LicenseHistory({ app }: { app: AdminApplication }) {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [historyRows, setHistoryRows] = useState<ProductLicenseHistoryRow[]>([]);
  const [customerFilter, setCustomerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<EffectiveLicenseStatus | 'all'>('all');
  const [viewingInvoice, setViewingInvoice] = useState<License | null>(null);
  //#endregion

  //#region Functions
  const loadHistory = useCallback(async () => {
    const productId = Number(app.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      setHistoryRows([]);
      return;
    }

    try {
      const res = await getLicenseDetails(productId);
      const items = Array.isArray(res.resultData) ? (res.resultData as ProductLicenseApiItem[]) : [];
      setHistoryRows(toLicenseHistoryRows(items));
    } catch (err) {
      console.error('Error fetching license history:', err);
      showToast(typeof err === 'string' ? err : 'Failed to load license history.', 'error');
      setHistoryRows([]);
    }
  }, [app.id, showToast]);

  const customerOptions = useMemo(() => {
    const unique = new Map<string, string>();
    for (const row of historyRows) {
      unique.set(row.orgId, row.customer);
    }
    return [
      { id: 'all', value: 'All Customers' },
      ...[...unique.entries()]
        .sort((left, right) => left[1].localeCompare(right[1]))
        .map(([id, value]) => ({ id, value })),
    ];
  }, [historyRows]);

  const rows = useMemo(() => historyRows
    .filter((row) => customerFilter === 'all' || row.orgId === customerFilter)
    .filter((row) => statusFilter === 'all' || row.status === statusFilter)
    .sort((left, right) => right.startDate.localeCompare(left.startDate)),
  [historyRows, customerFilter, statusFilter]);

  const openLicense = (row: ProductLicenseHistoryRow) => {
    setViewingInvoice({
      id: row.id,
      licenseNumber: `LIC-${String(row.licenseId).padStart(5, '0')}`,
      licenseKey: '',
      orgId: row.orgId,
      appId: app.id,
      title: `${row.customer} — ${app.name}`,
      startDate: row.startDate,
      expiryDate: row.expiryDate,
      status: row.status === 'suspended' ? 'suspended' : 'active',
      customMessage: row.remarks || undefined,
    });
  };
  //#endregion

  //#region Effects
  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);
  //#endregion

  const columns: DataTableColumn<ProductLicenseHistoryRow>[] = [
    {
      id: 'actions',
      header: 'Actions',
      pinLeft: true,
      width: '4rem',
      excludeFromExport: true,
      cell: (row) => (
        <CommonIconButton
          aria-label={`View license history for ${row.customer}`}
          tooltip="View"
          icon={<Eye size={15} />}
          onClick={() => openLicense(row)}
        />
      ),
    },
    {
      id: 'term',
      header: 'Term',
      width: '6.5rem',
      value: (row) => row.term,
      cell: (row) => (
        row.term === 'Current'
          ? <span className="font-bold text-[var(--success)]">Current</span>
          : <span className="text-[var(--text-faint)]">Past</span>
      ),
    },
    {
      id: 'customerCode',
      header: 'Customer Code',
      width: '12rem',
      value: (row) => row.customerCode,
      cell: (row) => <span className="font-mono text-xs text-[var(--text-secondary)]">{row.customerCode}</span>,
    },
    {
      id: 'customer',
      header: 'Customer',
      minWidth: '18rem',
      value: (row) => row.customer,
      cell: (row) => <span className="font-bold text-[var(--text-primary)]">{row.customer}</span>,
    },
    {
      id: 'startDate',
      header: 'Start Date',
      width: '8.5rem',
      value: (row) => row.startDate,
      cell: (row) => <span className="text-[var(--text-muted)]">{row.startDate ? formatDate(row.startDate) : '—'}</span>,
    },
    {
      id: 'expiryDate',
      header: 'Expiry Date',
      width: '8.5rem',
      value: (row) => row.expiryDate,
      cell: (row) => <span className="text-[var(--text-muted)]">{row.expiryDate ? formatDate(row.expiryDate) : '—'}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      width: '7.5rem',
      value: (row) => row.status,
      cell: (row) => <StatusBadge status={row.status} kind="license" />,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
        <div className="w-48 shrink-0">
          <Dropdown
            label="Customer"
            hideLabel
            placeholder="Select customer"
            searchable={false}
            clearable={false}
            value={customerFilter}
            onValueChange={(value) => setCustomerFilter(value ?? 'all')}
            options={customerOptions}
            className="min-h-8"
          />
        </div>
        <div className="w-44 shrink-0">
          <Dropdown
            label="Status"
            hideLabel
            placeholder="Select status"
            searchable={false}
            clearable={false}
            value={statusFilter}
            onValueChange={(value) => setStatusFilter((value as EffectiveLicenseStatus | 'all') ?? 'all')}
            options={STATUS_FILTERS.map((filter) => ({ id: filter.id, value: filter.label }))}
            className="min-h-8"
          />
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        exportFileName={`${app.shortName}-license-history`}
        exportTitle={`${app.name} — License history`}
        emptyMessage="No license history."
      />

      <InvoiceDetailModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
    </div>
  );
}
