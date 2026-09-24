import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate } from '@/modules/utils/formatDate';
import { getAccessRequests, normalizeAccessRequestList, type AccessRequestApiItem } from '@/modules/requests';
import RequestReviewModal from '@/modules/requests/pages/partials/RequestReviewModal';

type OrganizationRequestsPanelProps = {
  orgId: number;
};

const OrganizationRequestsPanel = ({ orgId }: OrganizationRequestsPanelProps) => {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [rows, setRows] = useState<AccessRequestApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  //#endregion

  //#region Functions
  const load = async () => {
    try {
      const { resultData, statusCode } = await getAccessRequests();
      const all = statusCode === 204 ? [] : normalizeAccessRequestList(resultData);
      setRows(all.filter((request) => request.organizationId === orgId));
    } catch (error) {
      console.error('Error loading access requests:', error);
      showToast(typeof error === 'string' ? error : 'Failed to load access requests.', 'error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { resultData, statusCode } = await getAccessRequests();
        if (cancelled) return;
        const all = statusCode === 204 ? [] : normalizeAccessRequestList(resultData);
        setRows(all.filter((request) => request.organizationId === orgId));
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
  }, [orgId, showToast]);
  //#endregion

  //#region Columns
  const columns: DataTableColumn<AccessRequestApiItem>[] = [
    {
      id: 'requester', header: 'Requester', width: '15rem',
      value: (request) => `${request.requesterName} (${request.requesterEmail})`,
      cell: (request) => (
        <span>
          <span className="block font-bold text-[var(--text-primary)]">{request.requesterName}</span>
          <span className="block text-xs text-[var(--text-muted)]">{request.requesterEmail}</span>
        </span>
      ),
    },
    {
      id: 'app', header: 'Application',
      value: (request) => request.productName || request.productId,
      cell: (request) => <span className="text-[var(--text-secondary)]">{request.productName || request.productId}</span>,
    },
    {
      id: 'status', header: 'Status',
      value: (request) => request.status,
      cell: (request) => <StatusBadge status={request.status} kind="request" />,
    },
    {
      id: 'submittedAt', header: 'Submitted',
      value: (request) => request.submittedAt,
      cell: (request) => <span className="text-[var(--text-muted)]">{formatDate(request.submittedAt)}</span>,
    },
    {
      id: 'review', header: 'Review', sortable: false, excludeFromExport: true,
      cell: (request) => (
        <CommonButton
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedId(request.accessRequestId);
            setSelectedProductId(request.accessRequestProductId || null);
          }}
        >
          Review
        </CommonButton>
      ),
    },
  ];
  //#endregion

  //#region Render
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Link to="/admin/requests?status=all">
          <CommonButton variant="outline" size="sm" iconLeft={<ExternalLink size={13} />}>View All Requests</CommonButton>
        </Link>
      </div>

      {!loading && rows.length === 0 ? (
        <EmptyState icon="📥" title="No requests" description="Access requests from this organization will appear here." />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(request) => String(request.accessRequestId)}
          initialSort={[{ id: 'submittedAt', desc: true }]}
          exportFileName="organization-requests"
          exportTitle="Organization — Requests"
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
};

export default OrganizationRequestsPanel;
