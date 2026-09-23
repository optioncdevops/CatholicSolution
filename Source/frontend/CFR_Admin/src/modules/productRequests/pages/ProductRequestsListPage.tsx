import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@/modules/authentication/hooks/useFeatureAccessLevel';
import { CommonButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { Tabs } from '@app/components/Tabs';
import ProductRequestReviewModal from './partials/ProductRequestReviewModal';
import { getProductRequests } from '../services/productRequestsService';
import type { ProductRequestApiItem, ProductRequestStatus } from '../types/productRequestsTypes';
import { normalizeProductRequestList } from '../utils/productRequestsHelpers';
import { PRODUCT_REQUEST_STATUS_FILTERS } from '../validator/ProductRequestsValidator';
import { formatDate } from '../../utils/formatDate';

const STATUS_FILTER_PARAM = 'status';

function ProductRequestsListPage() {
  //#region Hooks
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel('/admin/product-requests');
  const isReadOnly = accessLevel === 'readOnly';
  const [searchParams, setSearchParams] = useSearchParams();
  //#endregion

  //#region States
  const [rows, setRows] = useState<ProductRequestApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  //#endregion

  // The active status filter lives in the URL (?status=approved), not local state — bookmarkable
  // and shareable, matching how Access Requests already treats its own status filter.
  const statusFilter = (searchParams.get(STATUS_FILTER_PARAM) ?? 'all') as ProductRequestStatus | 'all';
  const setStatusFilter = useCallback((next: ProductRequestStatus | 'all') => {
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      if (next === 'all') params.delete(STATUS_FILTER_PARAM);
      else params.set(STATUS_FILTER_PARAM, next);
      return params;
    }, { replace: true });
  }, [setSearchParams]);

  //#region Functions
  const load = useCallback(async () => {
    try {
      const { resultData, statusCode } = await getProductRequests();
      setRows(statusCode === 204 ? [] : normalizeProductRequestList(resultData));
    } catch (error) {
      console.error('Error loading product requests:', error);
      showToast(typeof error === 'string' ? error : 'Failed to load product requests.', 'error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { resultData, statusCode } = await getProductRequests();
        if (cancelled) return;
        setRows(statusCode === 204 ? [] : normalizeProductRequestList(resultData));
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading product requests:', error);
        showToast(typeof error === 'string' ? error : 'Failed to load product requests.', 'error');
        setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);
  //#endregion

  //#region Columns
  const filteredRows = useMemo(() => rows
    .filter((request) => statusFilter === 'all' || request.status === statusFilter), [rows, statusFilter]);

  const columns: DataTableColumn<ProductRequestApiItem>[] = useMemo(() => [
    {
      id: 'productName', header: 'Product', pinLeft: true, width: '14rem',
      value: (request) => request.productName,
      cell: (request) => <span className="font-bold text-[var(--text-primary)]">{request.productName}</span>,
    },
    {
      id: 'requester', header: 'Requester', width: '12rem',
      value: (request) => request.requesterName,
      cell: (request) => <span className="text-[var(--text-secondary)]">{request.requesterName}</span>,
    },
    {
      id: 'requesterEmail', header: 'Email', width: '14rem',
      value: (request) => request.requesterEmail,
      cell: (request) => <span className="text-[var(--text-secondary)]">{request.requesterEmail}</span>,
    },
    { id: 'status', header: 'Status', value: (request) => request.status, cell: (request) => <StatusBadge status={request.status} kind="request" /> },
    { id: 'insertedDate', header: 'Submitted', value: (request) => request.insertedDate, cell: (request) => <span className="text-[var(--text-muted)]">{formatDate(request.insertedDate)}</span> },
    {
      id: 'review', header: 'Review', sortable: false, excludeFromExport: true,
      cell: (request) => {
        const isDecided = request.status !== 'pending';
        return (
          <CommonButton
            variant="outline"
            size="sm"
            disabled={isDecided}
            onClick={() => setSelectedId(request.productRequestId)}
          >
            {isDecided ? 'Reviewed' : 'Review'}
          </CommonButton>
        );
      },
    },
  ], []);
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Product Requests" />

      {isReadOnly ? <ReadOnlyBanner featureName="Product Requests" /> : null}

      <div className="overflow-hidden">
        <Tabs
          tabs={PRODUCT_REQUEST_STATUS_FILTERS.map(filter => ({
            id: filter.id,
            label: filter.label,
            count: filter.id === 'all' ? rows.length : rows.filter((request) => request.status === filter.id).length,
          }))}
          activeId={statusFilter}
          onChange={(id) => setStatusFilter(id as ProductRequestStatus | 'all')}
        />
      </div>

      {!loading && filteredRows.length === 0 ? (
        <EmptyState icon="📦" title="No product suggestions found" description="Try a different status filter." />
      ) : (
        <DataTable
          data={filteredRows}
          columns={columns}
          getRowId={(request) => String(request.productRequestId)}
          initialSort={[{ id: 'insertedDate', desc: true }]}
          exportFileName="catholic-solutions-product-requests"
          exportTitle="Catholic Solutions — Product Requests"
          emptyMessage="No product suggestions found."
        />
      )}

      <ProductRequestReviewModal
        productRequestId={selectedId}
        onClose={() => setSelectedId(null)}
        onResolved={load}
      />
    </div>
  );
  //#endregion
}

export default ProductRequestsListPage;
