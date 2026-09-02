import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { CommonIconButton } from '@app/components/buttons';
import { useToast } from '@shared/app/components/ToastProvider';
import { StatusBadge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate, accessStatusOf } from '@/modules/utils/formatDate';
import { getProductCustomers } from '../services/productService';
import type { ProductCustomerRow } from '../types/productTypes';
import { normalizeProductCustomerList, toProductCustomerRow } from '../utils/productHelpers';
import type { AdminApplication } from '@/modules/types';

type EffectiveCustomerStatus = 'active' | 'expiring-soon' | 'expired';

function effectiveStatusOf(org: ProductCustomerRow): EffectiveCustomerStatus {
  const access = accessStatusOf(org.expiryDate);
  if (access === 'expired' || access === 'expiring-soon') return access;
  return 'active';
}

const STATUS_FILTERS: Array<{ id: EffectiveCustomerStatus | 'all'; label: string; dot?: string }> = [
  { id: 'all', label: 'All Statuses' },
  { id: 'active', label: 'Active', dot: 'var(--success)' },
  { id: 'expiring-soon', label: 'Expiring Soon', dot: 'var(--warning)' },
  { id: 'expired', label: 'Expired', dot: 'var(--error)' },
];

export function CustomerDetails({
  app,
  onCountChange,
}: {
  app: AdminApplication;
  onCountChange?: (count: number) => void;
}) {
  //#region Hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [statusFilter, setStatusFilter] = useState<EffectiveCustomerStatus | 'all'>('all');
  const [productCustomers, setProductCustomers] = useState<ProductCustomerRow[]>([]);
  //#endregion

  //#region Functions
  const loadCustomers = useCallback(async () => {
    const productId = Number(app.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      setProductCustomers([]);
      onCountChange?.(0);
      return;
    }

    try {
      const res = await getProductCustomers(productId);
      const rows = normalizeProductCustomerList(res.resultData).map(toProductCustomerRow);
      setProductCustomers(rows);
      onCountChange?.(rows.length);
    } catch (err) {
      console.error('Error fetching product customers:', err);
      showToast(typeof err === 'string' ? err : 'Failed to load customers.', 'error');
      setProductCustomers([]);
      onCountChange?.(0);
    }
  }, [app.id, onCountChange, showToast]);

  const customers = useMemo(() => productCustomers
    .filter((org) => statusFilter === 'all' || effectiveStatusOf(org) === statusFilter)
    .sort((a, b) => a.name.localeCompare(b.name)),
  [productCustomers, statusFilter]);
  //#endregion

  //#region Effects
  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);
  //#endregion

  const columns: DataTableColumn<ProductCustomerRow>[] = [
    {
      id: 'actions', header: 'Actions', pinLeft: true, width: '4rem', excludeFromExport: true,
      cell: (org) => <CommonIconButton aria-label={`View ${org.name}`} tooltip="View" icon={<Eye size={15} />} onClick={() => navigate(`/admin/organizations/${org.id}`)} />,
    },
    {
      id: 'name', header: 'Organization', width: '16rem', value: (org) => org.name,
      cell: (org) => (
        <Link to={`/admin/organizations/${org.id}`} className="block min-w-0 truncate font-bold text-[var(--text-primary)] hover:underline" onClick={(event) => event.stopPropagation()}>
          {org.name}
        </Link>
      ),
    },
    { id: 'customerName', header: 'Customer Name', width: '13rem', value: (org) => org.primaryContact, cell: (org) => <span className="text-[var(--text-secondary)]">{org.primaryContact}</span> },
    { id: 'code', header: 'Code', width: '12rem', value: (org) => org.code, cell: (org) => <span className="font-mono text-xs text-[var(--text-secondary)]">{org.code}</span> },
    { id: 'email', header: 'Email', width: '16rem', value: (org) => org.contactEmail, cell: (org) => <span className="text-[var(--text-secondary)]">{org.contactEmail}</span> },
    { id: 'users', header: 'Users', width: '5.5rem', value: (org) => org.userCount, cell: (org) => <span className="text-[var(--text-secondary)]">{org.userCount}</span> },
    { id: 'start', header: 'Start Date', width: '8.5rem', value: (org) => org.createdAt, cell: (org) => <span className="text-[var(--text-muted)]">{formatDate(org.createdAt)}</span> },
    { id: 'expiry', header: 'Expiry Date', width: '8.5rem', value: (org) => org.expiryDate, cell: (org) => <span className="text-[var(--text-muted)]">{formatDate(org.expiryDate)}</span> },
    {
      id: 'status', header: 'Status', width: '7.5rem', value: (org) => effectiveStatusOf(org),
      cell: (org) => {
        const status = effectiveStatusOf(org);
        return status === 'expired' || status === 'expiring-soon'
          ? <StatusBadge status={status} kind="access" />
          : <StatusBadge status={status} kind="organization" />;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
        {STATUS_FILTERS.map((filter) => {
          const count = filter.id === 'all' ? productCustomers.length : productCustomers.filter((org) => effectiveStatusOf(org) === filter.id).length;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`admin-filter-chip inline-flex items-center gap-1.5 ${statusFilter === filter.id ? 'admin-filter-chip--active' : ''}`}
            >
              {filter.dot ? <span className="size-1.5 shrink-0 rounded-full" style={{ background: filter.dot }} aria-hidden="true" /> : null}
              {filter.label} ({count})
            </button>
          );
        })}
      </div>

      <DataTable
        data={customers}
        columns={columns}
        getRowId={(org) => org.id}
        onRowClick={(org) => navigate(`/admin/organizations/${org.id}`)}
        exportFileName={`${app.shortName}-customers`}
        exportTitle={`${app.name} — Customers`}
        emptyMessage="No customers found."
      />
    </div>
  );
}
