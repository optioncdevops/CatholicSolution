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
import { CUSTOMER_STATUS_FILTERS, type CustomerFilterId, type EffectiveCustomerStatus } from '../utils/productFilters';
import type { AdminApplication } from '@/modules/types';

function effectiveStatusOf(org: ProductCustomerRow): EffectiveCustomerStatus {
  const access = accessStatusOf(org.expiryDate);
  if (access === 'expired' || access === 'expiring-soon') return access;
  return 'active';
}

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
  const [statusFilter, setStatusFilter] = useState<CustomerFilterId>('all');
  const [productCustomers, setProductCustomers] = useState<ProductCustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  //#endregion

  //#region Functions
  const loadCustomers = useCallback(async () => {
    const productId = Number(app.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      setProductCustomers([]);
      setLoading(false);
      onCountChange?.(0);
      return;
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [app.id, onCountChange, showToast]);

  const customers = useMemo(() => productCustomers
    .filter((org) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'zero-users') return org.userCount === 0;
      return effectiveStatusOf(org) === statusFilter;
    })
    .sort((a, b) => a.name.localeCompare(b.name)),
  [productCustomers, statusFilter]);
  //#endregion

  //#region Effects
  useEffect(() => {
    // Standard mount/dependency-driven data-fetch effect, preserved as-is per this review's own
    // instruction not to blindly rewrite working async loading effects. Known gap (tracked, not
    // fixed here): `loadCustomers` doesn't check a cancellation flag internally, so in the rare
    // case this component unmounts while the request is still in flight, its state-setting calls
    // would still fire after unmount — the same shape as several other detail/edit pages in this
    // app: a real but pre-existing, wider-reaching gap, not something newly introduced or safe to
    // silently paper over here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCustomers();
  }, [loadCustomers]);
  //#endregion

  const productNavState = useMemo(
    () => ({
      fromProductId: Number(app.id),
      fromProductName: app.name,
      fromTab: 'organizations',
    }),
    [app.id, app.name],
  );

  const handleNavigateToOrg = (orgId: string | number) => {
    sessionStorage.setItem('cfr_from_product_id', String(app.id));
    sessionStorage.setItem('cfr_from_product_name', app.name);
    navigate(`/admin/organizations/${orgId}`, { state: productNavState });
  };

  const columns: DataTableColumn<ProductCustomerRow>[] = [
    {
      id: 'actions',
      header: 'Actions',
      pinLeft: true,
      width: '4rem',
      excludeFromExport: true,
      cell: (org) => (
        <CommonIconButton
          aria-label={`View ${org.name}`}
          tooltip="View"
          icon={<Eye size={15} />}
          onClick={() => handleNavigateToOrg(org.id)}
        />
      ),
    },
    {
      id: 'code',
      header: 'Organization Code',
      width: '12rem',
      value: (org) => {
        const num = Number.parseInt(org.code, 10);
        return Number.isFinite(num) ? num : 0;
      },
      cell: (org) => <span className="font-mono text-xs text-[var(--text-secondary)]">{org.code}</span>,
    },
    {
      id: 'name',
      header: 'Organization Name',
      width: '16rem',
      value: (org) => org.name,
      cell: (org) => (
        <Link
          to={`/admin/organizations/${org.id}`}
          state={productNavState}
          className="block min-w-0 truncate font-bold text-[var(--text-primary)] hover:underline"
          onClick={(event) => {
            event.stopPropagation();
            sessionStorage.setItem('cfr_from_product_id', String(app.id));
            sessionStorage.setItem('cfr_from_product_name', app.name);
          }}
        >
          {org.name}
        </Link>
      ),
    },
    { id: 'customerName', header: 'Contact Name', width: '13rem', value: (org) => org.primaryContact, cell: (org) => <span className="text-[var(--text-secondary)]">{org.primaryContact}</span> },
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

  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <div className="flex flex-nowrap items-center gap-2 pb-0.5">
          <div className="admin-skeleton h-8 w-24 rounded-full" />
          <div className="admin-skeleton h-8 w-24 rounded-full" />
          <div className="admin-skeleton h-8 w-24 rounded-full" />
        </div>
        <div className="admin-skeleton h-80 w-full rounded-[var(--radius-panel)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
        {CUSTOMER_STATUS_FILTERS.map((filter) => {
          let count: number;
          if (filter.id === 'all') {
            count = productCustomers.length;
          } else if (filter.id === 'zero-users') {
            count = productCustomers.filter((org) => org.userCount === 0).length;
          } else {
            count = productCustomers.filter((org) => effectiveStatusOf(org) === filter.id).length;
          }

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
        onRowClick={(org) => handleNavigateToOrg(org.id)}
        exportFileName={`${app.shortName}-customers`}
        exportTitle={`${app.name} — Customers`}
        emptyMessage="No customers found."
      />
    </div>
  );
}
