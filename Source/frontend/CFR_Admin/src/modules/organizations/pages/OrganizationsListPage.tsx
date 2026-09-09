import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Pencil, Plus, RefreshCw } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@shared/auth/hooks/useFeatureAccessLevel';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { Badge, StatusBadge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate } from '../../utils/formatDate';
import { getOrganizations, updateOrganization } from '../services/organizationsService';
import type { OrganizationApiItem } from '../types/organizationTypes';
import { formatOrgCode, normalizeOrganizationsList, ORG_STATUS_OPTIONS, orgTypeLabel, orgTypeTone } from '../utils/organizationHelpers';
import { OrganizationStatusDialog } from './partials/OrganizationStatusDialog';

const STATUS_FILTER_PARAM = 'status';

export function OrganizationsListPage() {
  //#region Hooks
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const accessLevel = useFeatureAccessLevel('/admin/organizations');
  const isReadOnly = accessLevel === 'readOnly';
  //#endregion

  //#region States
  const [rows, setRows] = useState<OrganizationApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingStatusOrg, setChangingStatusOrg] = useState<OrganizationApiItem | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
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
  //#endregion

  //#region Functions
  const loadOrganizations = useCallback(async () => {
    try {
      const { resultData, statusCode } = await getOrganizations();
      setRows(statusCode === 204 ? [] : normalizeOrganizationsList(resultData));
    } catch (error) {
      console.error('Error loading organizations:', error);
      showToast('Failed to load organizations.', 'error');
      setRows([]);
    }
  }, [showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { resultData, statusCode } = await getOrganizations();
        if (cancelled) return;
        setRows(statusCode === 204 ? [] : normalizeOrganizationsList(resultData));
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
  const handleView = useCallback((org: OrganizationApiItem) => {
    navigate(`/admin/organizations/${org.orgId}`);
  }, [navigate]);

  const handleEdit = useCallback((org: OrganizationApiItem) => {
    navigate(`/admin/organizations/${org.orgId}`, { state: { edit: true } });
  }, [navigate]);

  const handleConfirmStatus = async (status: string) => {
    if (!changingStatusOrg || isReadOnly) return;
    try {
      await updateOrganization({
        orgId: changingStatusOrg.orgId,
        orgName: changingStatusOrg.orgName,
        orgStatus: status,
        orgType: changingStatusOrg.orgType ?? '',
        contactEmail: changingStatusOrg.contactEmail ?? '',
        website: changingStatusOrg.website ?? '',
        contactPerson: changingStatusOrg.contactPerson ?? '',
        contactPhone: changingStatusOrg.contactPhone ?? '',
        address: changingStatusOrg.address ?? '',
        city: changingStatusOrg.city ?? '',
        state: changingStatusOrg.state ?? '',
        zip: changingStatusOrg.zip ?? '',
      });
      await loadOrganizations();
      const statusLabel = ORG_STATUS_OPTIONS.find((option) => option.id === status)?.value ?? status;
      showToast(`${changingStatusOrg.orgName} status changed to ${statusLabel}.`, 'success');
    } catch (error) {
      console.error('Error changing organization status:', error);
      showToast(typeof error === 'string' ? error : 'Failed to change status.', 'error');
    } finally {
      setChangingStatusOrg(null);
      setPendingStatus(null);
    }
  };
  //#endregion

  const filteredRows = useMemo(
    () => (statusFilter === 'all' ? rows : rows.filter((org) => org.orgStatus === statusFilter)),
    [rows, statusFilter],
  );

  // Filter chips always show the full real status vocabulary (Active/Inactive/Suspended) with a
  // live count each — including zero — rather than hiding a status just because no organization
  // currently has it. Any status outside that known vocabulary (shouldn't happen given the
  // service-layer allow-list, but defensively) is appended at the end.
  const statusFilterOptions = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((org) => counts.set(org.orgStatus, (counts.get(org.orgStatus) ?? 0) + 1));

    const known = ORG_STATUS_OPTIONS.map((option) => ({
      id: option.id,
      value: option.value,
      count: counts.get(option.id) ?? 0,
    }));

    const knownIds = new Set(ORG_STATUS_OPTIONS.map((option) => option.id));
    const unknown = Array.from(counts.entries())
      .filter(([id]) => !knownIds.has(id))
      .map(([id, count]) => ({ id, value: id.charAt(0).toUpperCase() + id.slice(1), count }));

    return [...known, ...unknown];
  }, [rows]);

  //#region Columns
  const columns: DataTableColumn<OrganizationApiItem>[] = useMemo(() => [
    {
      id: 'actions',
      header: 'Actions',
      pinLeft: true,
      width: '6.5rem',
      excludeFromExport: true,
      sortable: false,
      // DataTable puts this onClick on the <tr> itself, so a click on any button here bubbles
      // up to it unless stopped — without stopPropagation, Edit/Change Status would fire their
      // own action and then immediately get overridden by the row's onRowClick (View).
      cell: (org) => (
        <div className="flex items-center gap-0.5" onClick={(event) => event.stopPropagation()}>
          <CommonIconButton aria-label={`View ${org.orgName}`} tooltip="View" icon={<Eye size={14} />} onClick={() => handleView(org)} />
          <CommonIconButton aria-label={`Edit ${org.orgName}`} tooltip="Edit" icon={<Pencil size={14} />} onClick={() => handleEdit(org)} disabled={isReadOnly} />
          <CommonIconButton aria-label={`Change status for ${org.orgName}`} tooltip="Change Status" icon={<RefreshCw size={14} />} onClick={() => setChangingStatusOrg(org)} disabled={isReadOnly} />
        </div>
      ),
    },
    {
      id: 'orgCode', header: 'Org Code', width: '7rem', sortable: false,
      value: (org) => formatOrgCode(org.orgId),
      cell: (org) => <span className="font-mono text-xs font-bold text-[var(--text-muted)]">{formatOrgCode(org.orgId)}</span>,
    },
    {
      id: 'orgName', header: 'Organization', width: '14rem',
      value: (org) => org.orgName,
      cell: (org) => <span className="font-bold text-[var(--text-primary)]">{org.orgName}</span>,
    },
    {
      id: 'orgType', header: 'Type',
      value: (org) => org.orgType ?? '',
      cell: (org) => org.orgType ? <Badge tone={orgTypeTone(org.orgType)}>{orgTypeLabel(org.orgType)}</Badge> : <span className="text-[var(--text-faint)]">—</span>,
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
      id: 'status', header: 'Status',
      value: (org) => org.orgStatus,
      cell: (org) => <StatusBadge status={org.orgStatus} kind="organization" />,
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
      id: 'insertedDate', header: 'Created On',
      value: (org) => org.insertedDate,
      cell: (org) => <span className="text-[var(--text-muted)]">{formatDate(org.insertedDate)}</span>,
    },
  ], [handleView, handleEdit, isReadOnly]);
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Organizations"
        action={<CommonButton variant="headerSecondary" size="sm" iconLeft={<Plus size={14} />} onClick={() => navigate('/admin/organizations/add')} disabled={isReadOnly}>Add Organization</CommonButton>}
      />

      {isReadOnly ? <ReadOnlyBanner featureName="Organizations" /> : null}

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
          {statusFilterOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={statusFilter === option.id}
              onClick={() => setStatusFilter(option.id)}
              className={`admin-filter-chip ${statusFilter === option.id ? 'admin-filter-chip--active' : ''}`}
            >
              {option.value} ({option.count})
            </button>
          ))}
        </div>
      ) : null}

      {!loading && filteredRows.length === 0 ? (
        <EmptyState icon="🏢" title="No organizations found" description="Organizations will appear here once they exist in the database." />
      ) : (
        <DataTable
          data={filteredRows}
          columns={columns}
          getRowId={(org) => String(org.orgId)}
          onRowClick={(org) => handleView(org)}
          initialSort={[{ id: 'insertedDate', desc: true }]}
          exportFileName="catholic-solutions-organizations"
          exportTitle="Catholic Solutions — Organizations"
          emptyMessage="No organizations found."
        />
      )}

      <OrganizationStatusDialog
        organization={changingStatusOrg}
        pendingStatus={pendingStatus}
        onSelectStatus={setPendingStatus}
        onClose={() => { setChangingStatusOrg(null); setPendingStatus(null); }}
        onConfirm={(status) => void handleConfirmStatus(status)}
      />
    </div>
  );
  //#endregion
}
