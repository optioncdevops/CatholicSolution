import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Pencil, Plus, RefreshCw, ShieldAlert } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@/modules/authentication/hooks/useFeatureAccessLevel';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { Badge, StatusBadge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { getIntegrityIssueDetail, normalizeIntegrityIssueDetail, type IntegrityIssueDetailRow } from '@/modules/dashboard';
import { formatDate } from '../../utils/formatDate';
import { getDioceses, getOrganizations, updateOrganization } from '../services/organizationsService';
import type { OrganizationApiItem } from '../types/organizationTypes';
import { formatOrgCode, normalizeOrganizationsList, ORG_STATUS_OPTIONS, orgTypeLabel, orgTypeTone } from '../utils/organizationHelpers';
import { OrganizationStatusDialog } from './partials/OrganizationStatusDialog';

const STATUS_FILTER_PARAM = 'status';
const INTEGRITY_ISSUE_PARAM = 'integrityIssue';

// Mirrors the Dashboard Priority Alerts panel's own labels for the same keys (DashboardPage.tsx's
// alertRows) — kept as plain text here rather than a shared import so this page has no dependency
// on the exact shape of that array, just the handful of strings a "Review" link can send.
const INTEGRITY_ISSUE_LABELS: Record<string, string> = {
  activeOrganizationProductsWithoutMembers: 'Active app assignments with no members',
  activeUserProductsWithoutActiveOrganizationProduct: 'Member grants with no active org assignment',
  duplicateActiveUserProductMappings: 'Duplicate member/product mappings',
  expiredLicensesWithActiveOrganizationProduct: 'Expired licenses still granting access',
  expiredLicenses: 'Expired licenses',
};

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
  const [integrityIssueDetailRows, setIntegrityIssueDetailRows] = useState<IntegrityIssueDetailRow[] | null>(null);
  const [integrityIssueLoading, setIntegrityIssueLoading] = useState(false);
  const [diocesesMap, setDiocesesMap] = useState<Record<number, string>>({});
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

  // Arrived from the Dashboard's Priority Alerts "Review" link for a condition with no single
  // status value to filter by (e.g. "duplicate member/product mappings") — real navigation to a
  // real filtered list, not a popup, using the same backend drill-down the Dashboard itself calls.
  const integrityIssueKey = searchParams.get(INTEGRITY_ISSUE_PARAM);
  const integrityIssueLabel = integrityIssueKey ? (INTEGRITY_ISSUE_LABELS[integrityIssueKey] ?? integrityIssueKey) : '';
  const clearIntegrityIssueFilter = useCallback(() => {
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      params.delete(INTEGRITY_ISSUE_PARAM);
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
        const [orgRes, dioRes] = await Promise.all([
          getOrganizations(),
          getDioceses().catch(() => ({ resultData: [] }))
        ]);
        if (cancelled) return;
        setRows(orgRes.statusCode === 204 ? [] : normalizeOrganizationsList(orgRes.resultData));
        
        const map: Record<number, string> = {};
        (dioRes.resultData || []).forEach((d) => {
          map[d.dioceseId] = d.dioceseName;
        });
        setDiocesesMap(map);
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

  // Resolves ?integrityIssue=<key> into the exact affected records, using the same
  // Dashboard/GetIntegrityIssueDetail drill-down the Priority Alerts panel itself calls — so this
  // list shows precisely the organizations behind that count (not a guessed/approximate filter),
  // and can also show *why* each one is flagged (which product/member) via the extra column below.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!integrityIssueKey) {
        setIntegrityIssueDetailRows(null);
        return;
      }
      setIntegrityIssueLoading(true);
      try {
        const { resultData } = await getIntegrityIssueDetail(integrityIssueKey);
        if (cancelled) return;
        setIntegrityIssueDetailRows(normalizeIntegrityIssueDetail(resultData));
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading integrity issue detail:', error);
        showToast(typeof error === 'string' ? error : 'Failed to load the affected organizations.', 'error');
        setIntegrityIssueDetailRows([]);
      } finally {
        if (!cancelled) setIntegrityIssueLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [integrityIssueKey, showToast]);
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
        dioceseId: changingStatusOrg.dioceseId ?? null,
      });
      await loadOrganizations();
      const statusLabel = ORG_STATUS_OPTIONS.find((option) => option.id === status)?.value ?? status;
      showToast(`Organization status changed to ${statusLabel}.`, 'success');
    } catch (error) {
      console.error('Error changing organization status:', error);
      showToast(typeof error === 'string' ? error : 'Failed to change status.', 'error');
    } finally {
      setChangingStatusOrg(null);
      setPendingStatus(null);
    }
  };
  //#endregion

  // The integrity-issue filter is the outer scope, the status chips narrow further within it —
  // never the other way around. Without this, arriving with ?integrityIssue= showed a banner
  // saying "32 organizations" while the status chips right below it still read the full
  // unfiltered totals (e.g. "All Statuses (249)"), which reads as the filter not actually doing
  // anything even when the table itself was correctly limited underneath.
  // Groups the flagged records by OrgId — reused both to filter the list down to just the
  // affected organizations and to show *why* each one is flagged (its own "Flagged Detail"
  // column below), instead of leaving the admin to guess from Users/Products counts alone.
  const integrityIssueDetailByOrg = useMemo(() => {
    const map = new Map<number, IntegrityIssueDetailRow[]>();
    if (!integrityIssueDetailRows) return map;
    for (const detailRow of integrityIssueDetailRows) {
      if (detailRow.orgId == null) continue;
      const existing = map.get(detailRow.orgId) ?? [];
      existing.push(detailRow);
      map.set(detailRow.orgId, existing);
    }
    return map;
  }, [integrityIssueDetailRows]);

  const integrityFilteredRows = useMemo(
    () => (integrityIssueDetailRows ? rows.filter((org) => integrityIssueDetailByOrg.has(org.orgId)) : rows),
    [rows, integrityIssueDetailRows, integrityIssueDetailByOrg],
  );

  const filteredRows = useMemo(
    () => (statusFilter === 'all' ? integrityFilteredRows : integrityFilteredRows.filter((org) => org.orgStatus === statusFilter)),
    [integrityFilteredRows, statusFilter],
  );

  // Filter chips always show the full real status vocabulary (Active/Inactive/Suspended) with a
  // live count each — including zero — rather than hiding a status just because no organization
  // currently has it. Any status outside that known vocabulary (shouldn't happen given the
  // service-layer allow-list, but defensively) is appended at the end. Counts are scoped to
  // integrityFilteredRows (the full list when no integrity filter is active) so they always add
  // up to whatever total is currently being shown, never a stale full-dataset number.
  const statusFilterOptions = useMemo(() => {
    const counts = new Map<string, number>();
    integrityFilteredRows.forEach((org) => counts.set(org.orgStatus, (counts.get(org.orgStatus) ?? 0) + 1));

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
  }, [integrityFilteredRows]);

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
          {!isReadOnly && (
            <CommonIconButton aria-label={`Edit ${org.orgName}`} tooltip="Edit" icon={<Pencil size={14} />} onClick={() => handleEdit(org)} />
          )}
          {!isReadOnly && (
            <CommonIconButton aria-label={`Change status for ${org.orgName}`} tooltip="Change Status" icon={<RefreshCw size={14} />} onClick={() => setChangingStatusOrg(org)} />
          )}
        </div>
      ),
    },
    {
      id: 'orgCode', header: 'Org Code', width: '7.1rem',
      // Sort by the raw numeric OrgId, not the formatted string — otherwise "100" would sort
      // before "99" (lexicographic comparison of strings rather than numeric comparison).
      value: (org) => org.orgId,
      cell: (org) => <span className="font-mono text-xs font-bold text-[var(--text-muted)]">{formatOrgCode(org.orgId)}</span>,
    },
    {
      id: 'orgName', header: 'Organization', width: '14rem',
      value: (org) => org.orgName,
      cell: (org) => <span className="font-bold text-[var(--text-primary)]">{org.orgName}</span>,
    },
    {
      id: 'diocese', header: 'Diocese', width: '12rem',
      value: (org) => org.dioceseId ? (diocesesMap[org.dioceseId] || `ID: ${org.dioceseId}`) : '',
      cell: (org) => <span className="text-[var(--text-secondary)]">{org.dioceseId ? (diocesesMap[org.dioceseId] || `ID: ${org.dioceseId}`) : '—'}</span>,
    },
    // Only present while an integrity-issue filter is active — shows exactly which product(s)/
    // member(s) triggered the flag for this org, instead of leaving the admin to guess from the
    // generic Users/Products counts (an org can have 3 active app assignments where only 1 of
    // them is actually missing a member, so the plain "Products: 3" column alone doesn't say which).
    ...(integrityIssueKey ? [{
      id: 'integrityIssueDetail',
      header: 'Flagged Detail',
      width: '18rem',
      sortable: false,
      value: (org: OrganizationApiItem) => (integrityIssueDetailByOrg.get(org.orgId) ?? []).map((detailRow) => detailRow.detail).join('; '),
      cell: (org: OrganizationApiItem) => {
        const matches = integrityIssueDetailByOrg.get(org.orgId) ?? [];
        if (matches.length === 0) return <span className="text-[var(--text-faint)]">—</span>;
        return (
          <ul className="flex flex-col gap-1">
            {matches.map((detailRow, index) => (
              <li key={index} className="text-xs text-[var(--text-secondary)]">
                {detailRow.productName ? <span className="font-bold">{detailRow.productName}</span> : null}
                {detailRow.memberName ? <span className="font-bold">{detailRow.productName ? ' — ' : ''}{detailRow.memberName}</span> : null}
                {detailRow.detail ? <span className="block text-[var(--text-muted)]">{detailRow.detail}</span> : null}
              </li>
            ))}
          </ul>
        );
      },
    } as DataTableColumn<OrganizationApiItem>] : []),
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
      cell: (org) => (org.userCount > 0 ? (
        <Link 
          to="/admin/cfr-users" 
          state={{ orgId: org.orgId }}
          className="text-[var(--primary)] hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {org.userCount}
        </Link>
      ) : (
        <span className="text-[var(--text-secondary)]">{org.userCount}</span>
      )),
    },
    {
      id: 'productCount', header: 'Products',
      value: (org) => org.productCount,
      cell: (org) => (org.productCount > 0 ? (
        <Link 
          to={`/admin/organizations/${org.orgId}`}
          state={{ tab: 'products' }}
          className="text-[var(--primary)] hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {org.productCount}
        </Link>
      ) : (
        <span className="text-[var(--text-secondary)]">{org.productCount}</span>
      )),
    },
    {
      id: 'insertedDate', header: 'Created On',
      value: (org) => org.insertedDate,
      cell: (org) => <span className="text-[var(--text-muted)]">{formatDate(org.insertedDate)}</span>,
    },
  ], [handleView, handleEdit, isReadOnly, integrityIssueKey, integrityIssueDetailByOrg, diocesesMap]);
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Organizations"
        action={!isReadOnly && <CommonButton variant="headerSecondary" size="sm" iconLeft={<Plus size={14} />} onClick={() => navigate('/admin/organizations/add')}>Add Organization</CommonButton>}
      />

      {isReadOnly ? <ReadOnlyBanner featureName="Organizations" /> : null}

      {integrityIssueKey ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-panel)] border border-[var(--warning)] bg-[var(--warning-bg)] px-3 py-2.5">
          <ShieldAlert size={14} className="shrink-0 text-[var(--warning)]" aria-hidden="true" />
          <p className="flex-1 text-xs font-semibold text-[var(--warning)]">
            {integrityIssueLoading
              ? `Loading organizations affected by "${integrityIssueLabel}"…`
              : `Showing ${integrityFilteredRows.length} organization${integrityFilteredRows.length === 1 ? '' : 's'} affected by "${integrityIssueLabel}".`}
          </p>
          <button
            id="btnClearIntegrityIssueFilter"
            type="button"
            onClick={clearIntegrityIssueFilter}
            className="shrink-0 text-xs font-bold text-[var(--warning)] hover:underline"
          >
            Clear filter
          </button>
        </div>
      ) : null}

      {!loading ? (
        <div role="group" aria-label="Filter organizations by status" className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            aria-pressed={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
            className={`admin-filter-chip ${statusFilter === 'all' ? 'admin-filter-chip--active' : ''}`}
          >
            All Statuses ({integrityFilteredRows.length})
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

      {integrityIssueLoading ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="admin-skeleton h-10 w-full" />)}
        </div>
      ) : !loading && filteredRows.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="No organizations found"
          description={integrityIssueKey ? `No organizations currently match "${integrityIssueLabel}".` : 'Organizations will appear here once they exist in the database.'}
        />
      ) : (
        <DataTable
          data={filteredRows}
          columns={columns}
          getRowId={(org) => String(org.orgId)}
          onRowClick={(org) => handleView(org)}
          initialSort={[{ id: 'insertedDate', desc: true }]}
          exportFileName="Organization_List"
          exportTitle="Organization List"
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
