import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonIconButton } from '@app/components/buttons';
import { Badge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate } from '../utils/formatDate';
import LiveOrganizationFormModal from './liveOrganizations/pages/partials/LiveOrganizationFormModal';
import { getLiveOrganizations } from './liveOrganizations';
import type { LiveOrganizationApiItem } from './liveOrganizations';
import { normalizeLiveOrganizationsList, ORG_STATUS_OPTIONS } from './liveOrganizations';

const STATUS_FILTER_PARAM = 'status';

function titleCase(value: string): string {
  return value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);
}

export function OrganizationsListPage() {
  //#region Hooks
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  //#endregion

  //#region States
  const [rows, setRows] = useState<LiveOrganizationApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<LiveOrganizationApiItem | null>(null);
  //#endregion

  // The active status filter lives in the URL (?status=active), not local state — this makes the
  // filtered view bookmarkable/shareable and keeps it intact across a refresh or back-navigation,
  // matching how production admin tools (Stripe, Linear, etc.) treat list filters.
  const statusFilter = searchParams.get(STATUS_FILTER_PARAM) ?? 'all';
  const setStatusFilter = useCallback((next: string) => {
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
      const { resultData, statusCode } = await getLiveOrganizations();
      setRows(statusCode === 204 ? [] : normalizeLiveOrganizationsList(resultData));
    } catch (error) {
      console.error('Error loading organizations:', error);
      showToast('Failed to load organizations.', 'error');
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
        const { resultData, statusCode } = await getLiveOrganizations();
        if (cancelled) return;
        setRows(statusCode === 204 ? [] : normalizeLiveOrganizationsList(resultData));
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading organizations:', error);
        showToast('Failed to load organizations.', 'error');
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

  //#region Handlers
  const handleOpenEdit = (org: LiveOrganizationApiItem) => {
    setEditingOrg(org);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingOrg(null);
  };
  //#endregion

  // Filter options are the real, fixed status vocabulary core.Organization.OrgStatus supports
  // (shared with the edit dropdown) — not "whatever happens to exist in the current data" — so
  // e.g. "Inactive" is always selectable even when every org currently loaded is active.
  const filteredRows = useMemo(
    () => (statusFilter === 'all' ? rows : rows.filter((org) => org.orgStatus === statusFilter)),
    [rows, statusFilter],
  );

  //#region Columns
  const columns: DataTableColumn<LiveOrganizationApiItem>[] = useMemo(() => [
    {
      id: 'actions',
      header: 'Actions',
      pinLeft: true,
      width: '4rem',
      excludeFromExport: true,
      sortable: false,
      cell: (org) => (
        <CommonIconButton aria-label={`Edit ${org.orgName}`} tooltip="Edit" icon={<Pencil size={14} />} onClick={() => handleOpenEdit(org)} />
      ),
    },
    {
      id: 'orgName', header: 'Organization', width: '14rem',
      value: (org) => org.orgName,
      cell: (org) => <span className="font-bold text-[var(--text-primary)]">{org.orgName}</span>,
    },
    {
      id: 'website', header: 'Website', width: '12rem',
      value: (org) => org.website ?? '',
      cell: (org) => (org.website
        ? <a href={/^https?:\/\//i.test(org.website) ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline" onClick={(event) => event.stopPropagation()}>{org.website}</a>
        : <span className="text-[var(--text-faint)]">—</span>),
    },
    {
      id: 'contactPerson', header: 'Contact Person',
      value: (org) => org.contactPerson ?? '',
      cell: (org) => <span className="text-[var(--text-secondary)]">{org.contactPerson || '—'}</span>,
    },
    {
      id: 'contactPhone', header: 'Contact Number',
      value: (org) => org.contactPhone ?? '',
      cell: (org) => <span className="text-[var(--text-secondary)]">{org.contactPhone || '—'}</span>,
    },
    {
      id: 'contactEmail', header: 'Contact Email',
      value: (org) => org.contactEmail ?? '',
      cell: (org) => <span className="text-[var(--text-secondary)]">{org.contactEmail || '—'}</span>,
    },
    {
      id: 'status', header: 'Status',
      value: (org) => org.orgStatus,
      cell: (org) => <Badge tone={org.orgStatus === 'active' ? 'success' : 'neutral'}>{titleCase(org.orgStatus)}</Badge>,
    },
    {
      id: 'userCount', header: 'Users',
      value: (org) => org.userCount,
      cell: (org) => <span className="text-[var(--text-secondary)]">{org.userCount}</span>,
    },
    {
      id: 'productCount', header: 'Products',
      value: (org) => org.productCount,
      cell: (org) => <span className="text-[var(--text-secondary)]">{org.productCount}</span>,
    },
    {
      id: 'updatedDate', header: 'Last Updated',
      value: (org) => org.updatedDate ?? org.insertedDate,
      cell: (org) => <span className="text-[var(--text-muted)]">{formatDate(org.updatedDate ?? org.insertedDate)}</span>,
    },
  ], []);
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Organizations" />

      {!loading ? (
        <div role="group" aria-label="Filter organizations by status" className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            aria-pressed={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
            className={`admin-filter-chip ${statusFilter === 'all' ? 'admin-filter-chip--active' : ''}`}
          >
            All Statuses ({rows.length})
          </button>
          {ORG_STATUS_OPTIONS.map((option) => {
            const count = rows.filter((org) => org.orgStatus === option.id).length;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={statusFilter === option.id}
                onClick={() => setStatusFilter(option.id)}
                className={`admin-filter-chip ${statusFilter === option.id ? 'admin-filter-chip--active' : ''}`}
              >
                {option.value} ({count})
              </button>
            );
          })}
        </div>
      ) : null}

      {!loading && filteredRows.length === 0 ? (
        <EmptyState icon="🏢" title="No organizations found" description="Organizations will appear here once they exist in the database." />
      ) : (
        <DataTable
          data={filteredRows}
          columns={columns}
          getRowId={(org) => String(org.orgId)}
          onRowClick={(org) => handleOpenEdit(org)}
          exportFileName="catholic-solutions-organizations"
          exportTitle="Catholic Solutions — Organizations"
          emptyMessage="No organizations found."
        />
      )}

      <LiveOrganizationFormModal open={formOpen} organization={editingOrg} onClose={handleCloseForm} onSaved={load} />
    </div>
  );
  //#endregion
}
