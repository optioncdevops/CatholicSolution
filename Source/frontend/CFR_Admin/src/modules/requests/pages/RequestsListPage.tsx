import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@/modules/authentication/hooks/useFeatureAccessLevel';
import { CommonButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { Dropdown } from '@app/components/formControls';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { Tabs } from '@app/components/Tabs';
import RequestReviewModal from './partials/RequestReviewModal';
import { getAccessRequests } from '../services/requestsService';
import type { AccessRequestApiItem, RequestStatus } from '../types/requestsTypes';
import { normalizeAccessRequestList, uniqueRequestFilterOptions } from '../utils/requestsHelpers';
import { REQUEST_STATUS_FILTERS } from '../validator/RequestsValidator';
import { formatDate } from '../../utils/formatDate';

const STATUS_FILTER_PARAM = 'status';

function RequestsListPage() {
  //#region Hooks
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel('/admin/requests');
  const isReadOnly = accessLevel === 'readOnly';
  const [searchParams, setSearchParams] = useSearchParams();
  //#endregion

  //#region States
  const [rows, setRows] = useState<AccessRequestApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [appFilter, setAppFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  //#endregion

  // The active status filter lives in the URL (?status=approved), not local state — bookmarkable
  // and shareable, and lets other pages (the Dashboard's Priority Alerts) deep-link straight to a
  // specific status instead of dumping the visitor on an unfiltered list, matching how the
  // Organizations list already treats its own status filter.
  const statusFilter = (searchParams.get(STATUS_FILTER_PARAM) ?? 'all') as RequestStatus | 'all';
  const setStatusFilter = useCallback((next: RequestStatus | 'all') => {
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
      const { resultData, statusCode } = await getAccessRequests();
      setRows(statusCode === 204 ? [] : normalizeAccessRequestList(resultData));
    } catch (error) {
      console.error('Error loading access requests:', error);
      showToast(typeof error === 'string' ? error : 'Failed to load access requests.', 'error');
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
        const { resultData, statusCode } = await getAccessRequests();
        if (cancelled) return;
        setRows(statusCode === 204 ? [] : normalizeAccessRequestList(resultData));
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading access requests:', error);
        showToast(typeof error === 'string' ? error : 'Failed to load access requests.', 'error');
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
    .filter((request) => statusFilter === 'all' || request.status === statusFilter)
    .filter((request) => appFilter === 'all' || request.productId === appFilter)
    .filter((request) => orgFilter === 'all' || String(request.organizationId) === orgFilter), [rows, statusFilter, appFilter, orgFilter]);

  const appOptions = useMemo(() => uniqueRequestFilterOptions(rows, 'productId', 'productName'), [rows]);
  const orgOptions = useMemo(() => uniqueRequestFilterOptions(rows, 'organizationId', 'organizationName'), [rows]);

  const columns: DataTableColumn<AccessRequestApiItem>[] = useMemo(() => [
    {
      id: 'requester', header: 'Requester', pinLeft: true, width: '12rem',
      value: (request) => request.requesterName,
      cell: (request) => <span className="font-bold text-[var(--text-primary)]">{request.requesterName}</span>,
    },
    {
      id: 'requesterEmail', header: 'Email', width: '14rem',
      value: (request) => request.requesterEmail,
      cell: (request) => <span className="text-[var(--text-secondary)]">{request.requesterEmail}</span>,
    },
    { id: 'org', header: 'Organization', value: (request) => request.organizationName || '—', cell: (request) => <span className="text-[var(--text-secondary)]">{request.organizationName || '—'}</span> },
    { id: 'app', header: 'Application', value: (request) => request.productName || request.productId, cell: (request) => <span className="text-[var(--text-secondary)]">{request.productName || request.productId}</span> },
    { id: 'status', header: 'Status', value: (request) => request.status, cell: (request) => <StatusBadge status={request.status} kind="request" /> },
    { id: 'submittedAt', header: 'Submitted', value: (request) => request.submittedAt, cell: (request) => <span className="text-[var(--text-muted)]">{formatDate(request.submittedAt)}</span> },
    {
      id: 'review', header: 'Review', sortable: false, excludeFromExport: true,
      cell: (request) => {
        const isApproved = request.status === 'approved' || request.status === 'rejected';
        return (
          <CommonButton
            variant="outline"
            size="sm"
            disabled={isApproved}
            onClick={() => {
              setSelectedId(request.accessRequestId);
              setSelectedProductId(request.accessRequestProductId || null);
            }}
          >
            {isApproved ? 'Reviewed' : 'Review'}
          </CommonButton>
        );
      },
    },
  ], []);
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Access Requests" />

      {isReadOnly ? <ReadOnlyBanner featureName="Requests" /> : null}

      <div className="overflow-hidden">
        <Tabs
          tabs={REQUEST_STATUS_FILTERS.map(filter => ({
            id: filter.id,
            label: filter.label,
            count: filter.id === 'all' ? rows.length : rows.filter((request) => request.status === filter.id).length,
          }))}
          activeId={statusFilter}
          onChange={(id) => setStatusFilter(id as RequestStatus | 'all')}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-56 shrink-0">
          <Dropdown
            id="filterAccessRequestApplication"
            label="Application" searchable={false} clearable={false}
            value={appFilter}
            onValueChange={(value) => setAppFilter(value ?? 'all')}
            options={[{ id: 'all', value: 'All Applications' }, ...appOptions]}
            className="min-h-8"
          />
        </div>
        <div className="w-56 shrink-0">
          <Dropdown
            id="filterAccessRequestOrganization"
            label="Organization" searchable={false} clearable={false}
            value={orgFilter}
            onValueChange={(value) => setOrgFilter(value ?? 'all')}
            options={[{ id: 'all', value: 'All Organizations' }, ...orgOptions]}
            className="min-h-8"
          />
        </div>
      </div>

      {!loading && filteredRows.length === 0 ? (
        <EmptyState icon="📭" title="No requests found" description="Try a different filter combination." />
      ) : (
        <DataTable
          data={filteredRows}
          columns={columns}
          getRowId={(request) => String(request.accessRequestId)}
          initialSort={[{ id: 'submittedAt', desc: true }]}
          exportFileName="catholic-solutions-access-requests"
          exportTitle="Catholic Solutions — Access Requests"
          emptyMessage="No requests found."
        />
      )}

      <RequestReviewModal
        accessRequestId={selectedId}
        accessRequestProductId={selectedProductId}
        onClose={() => {
          setSelectedId(null);
          setSelectedProductId(null);
        }}
        onResolved={load}
      />
    </div>
  );
  //#endregion
}

export default RequestsListPage;
