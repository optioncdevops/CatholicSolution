import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { StatusBadge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { effectiveLicenseStatus, formatDate } from '@/modules/utils/formatDate';
import { getOrganizationLicenses } from '../../services/organizationsService';
import type { OrganizationLicenseApiItem } from '../../types/organizationTypes';

type EffectiveStatus = 'active' | 'suspended' | 'expiring-soon' | 'expired';

// Sort rank for the Status column — active/expiring-soon licenses first, expired/suspended
// (effectively unusable) ones last, so the table reads newest/current-first by default.
const STATUS_RANK: Record<EffectiveStatus, number> = {
  active: 0,
  'expiring-soon': 1,
  suspended: 2,
  expired: 3,
};

const STATUS_FILTERS: Array<{ id: EffectiveStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'expiring-soon', label: 'Expiring soon' },
  { id: 'expired', label: 'Expired' },
  { id: 'suspended', label: 'Suspended' },
];

// A license with no expiry date is perpetual — its effective status is just the stored value,
// never computed against a date that doesn't exist.
function statusOf(license: OrganizationLicenseApiItem): EffectiveStatus {
  const stored = license.licenseStatus === 'suspended' ? 'suspended' : 'active';
  if (!license.expiryDate) return stored;
  return effectiveLicenseStatus(stored, license.expiryDate);
}

type OrganizationLicensesPanelProps = {
  orgId: number;
};

const OrganizationLicensesPanel = ({ orgId }: OrganizationLicensesPanelProps) => {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [rows, setRows] = useState<OrganizationLicenseApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<EffectiveStatus | 'all'>('all');
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { resultData, statusCode } = await getOrganizationLicenses(orgId);
        if (cancelled) return;
        setRows(statusCode === 204 || !Array.isArray(resultData) ? [] : resultData as OrganizationLicenseApiItem[]);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading organization licenses:', error);
        showToast(typeof error === 'string' ? error : 'Failed to load licenses.', 'error');
        setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orgId, showToast]);
  //#endregion

  const filteredRows = useMemo(
    () => (statusFilter === 'all' ? rows : rows.filter((license) => statusOf(license) === statusFilter)),
    [rows, statusFilter],
  );

  //#region Columns
  const columns: DataTableColumn<OrganizationLicenseApiItem>[] = [
    {
      id: 'productName', header: 'Product', width: '14rem',
      value: (license) => license.productName,
      cell: (license) => <span className="font-bold text-[var(--text-primary)]">{license.productName}</span>,
    },
    {
      id: 'licenseType', header: 'License Type',
      value: (license) => license.licenseType ?? '',
      cell: (license) => <span className="text-[var(--text-secondary)]">{license.licenseType || '—'}</span>,
    },
    {
      id: 'activationDate', header: 'Activation Date',
      value: (license) => license.activationDate,
      cell: (license) => <span className="text-[var(--text-muted)]">{formatDate(license.activationDate)}</span>,
    },
    {
      id: 'expiryDate', header: 'Expiry Date',
      value: (license) => license.expiryDate ?? '',
      cell: (license) => <span className="text-[var(--text-muted)]">{license.expiryDate ? formatDate(license.expiryDate) : 'No expiry'}</span>,
    },
    {
      id: 'status', header: 'Status',
      value: (license) => STATUS_RANK[statusOf(license)],
      cell: (license) => <StatusBadge status={statusOf(license)} kind="license" />,
    },
    {
      id: 'remarks', header: 'Remarks',
      value: (license) => license.remarks ?? '',
      cell: (license) => <span className="text-[var(--text-secondary)]">{license.remarks || '—'}</span>,
    },
  ];
  //#endregion

  //#region Render
  return (
    <div className="flex flex-col gap-3">
      {!loading ? (
        <div role="group" aria-label="Filter licenses by status" className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
          {STATUS_FILTERS.map((filter) => {
            const count = filter.id === 'all' ? rows.length : rows.filter((license) => statusOf(license) === filter.id).length;
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={statusFilter === filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`admin-filter-chip ${statusFilter === filter.id ? 'admin-filter-chip--active' : ''}`}
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>
      ) : null}

      {!loading && filteredRows.length === 0 ? (
        <EmptyState icon="🔑" title="No licenses found" description={rows.length === 0 ? 'Licenses issued against this organization\'s products will appear here.' : 'Try a different status filter.'} />
      ) : (
        <DataTable
          data={filteredRows}
          columns={columns}
          getRowId={(license) => String(license.licenseId)}
          initialSort={[{ id: 'status', desc: false }]}
          exportFileName="organization-licenses"
          exportTitle="Organization — Licenses"
          emptyMessage="No licenses found."
        />
      )}
    </div>
  );
  //#endregion
};

export default OrganizationLicensesPanel;
