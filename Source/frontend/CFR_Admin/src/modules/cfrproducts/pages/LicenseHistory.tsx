import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { CommonIconButton } from '@app/components/buttons';
import { useToast } from '@shared/app/components/ToastProvider';
import { Dropdown } from '@app/components/formControls';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate } from '@/modules/utils/formatDate';
import { getLicenseDetails } from '../services/productService';
import type { ProductLicenseApiItem, ProductLicenseHistoryRow } from '../types/productTypes';
import { toLicenseHistoryRows } from '../utils/productHelpers';
import { LICENSE_HISTORY_STATUS_FILTERS, InvoiceStatusBadge, type LicenseHistoryStatusFilter } from '../utils/productFilters';
import { InvoiceDetailModal } from './LicenseDetails';
import type { AdminApplication, License } from '@/modules/types';

export function LicenseHistory({ app }: { app: AdminApplication }) {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [historyRows, setHistoryRows] = useState<ProductLicenseHistoryRow[]>([]);
  const [customerFilter, setCustomerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<LicenseHistoryStatusFilter>('all');
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
      { id: 'all', value: 'All Organizations' },
      ...[...unique.entries()]
        .sort((left, right) => left[1].localeCompare(right[1]))
        .map(([id, value]) => ({ id, value })),
    ];
  }, [historyRows]);

  const rows = useMemo(() => historyRows
    .filter((row) => customerFilter === 'all' || row.orgId === customerFilter)
    .filter((row) => statusFilter === 'all' || row.paymentStatus === statusFilter)
    .sort((left, right) => right.startDate.localeCompare(left.startDate)),
  [historyRows, customerFilter, statusFilter]);

  const openLicense = (row: ProductLicenseHistoryRow) => {
    setViewingInvoice({
      id: row.id,
      licenseNumber: row.invoiceNumber,
      licenseKey: '',
      orgId: row.orgId,
      appId: app.id,
      title: `${row.customer} — ${row.invoiceNumber}`,
      startDate: row.startDate,
      expiryDate: row.expiryDate,
      status: 'active',
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
          aria-label={`View invoice ${row.invoiceNumber}`}
          tooltip="View"
          icon={<Eye size={15} />}
          onClick={() => openLicense(row)}
        />
      ),
    },
    {
      id: 'customerCode',
      header: 'Organization Code',
      width: '12rem',
      value: (row) => row.customerCode,
      cell: (row) => <span className="font-mono text-xs text-[var(--text-secondary)]">{row.customerCode}</span>,
    },
    {
      id: 'customer',
      header: 'Organization',
      width: '18rem',
      value: (row) => row.customer,
      cell: (row) => <span className="font-bold text-[var(--text-primary)]">{row.customer}</span>,
    },
    {
      id: 'invoiceNumber',
      header: 'Invoice',
      width: '12rem',
      value: (row) => row.invoiceNumber,
      cell: (row) => (
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {row.invoiceNumber}
        </span>
      ),
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
      id: 'paidOn',
      header: 'Paid On',
      width: '13rem',
      value: (row) => row.paidOn ?? 'Not paid yet',
      cell: (row) => (
        <span className={row.paidOn ? 'text-xs text-[var(--text-secondary)]' : 'text-xs text-[var(--text-muted)]'}>
          {row.paidOn ?? 'Not paid yet'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: '7.5rem',
      value: (row) => row.paymentStatus,
      cell: (row) => <InvoiceStatusBadge status={row.paymentStatus} />,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
        <div className="w-48 shrink-0">
          <Dropdown
            label="Organization"
            hideLabel
            placeholder="Select organization"
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
            onValueChange={(value) => setStatusFilter((value as LicenseHistoryStatusFilter) ?? 'all')}
            options={LICENSE_HISTORY_STATUS_FILTERS.map((filter) => ({ id: filter.id, value: filter.label }))}
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
