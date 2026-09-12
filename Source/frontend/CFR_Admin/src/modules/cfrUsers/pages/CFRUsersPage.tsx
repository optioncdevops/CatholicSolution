import { useCallback, useEffect, useMemo, useState } from 'react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@shared/auth/hooks/useFeatureAccessLevel';
import { Dropdown } from '@app/components/formControls';
import { StatusBadge } from '@app/components/Badge';
import { CommonButton } from '@app/components/buttons';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { Tabs, TabPanel } from '@app/components/Tabs';
import { formatDate } from '@/modules/utils/formatDate';
import {
  getOrganizationById,
  getOrganizations,
  getOrganizationUsers,
} from '@/modules/organizations/services/organizationsService';
import { normalizeOrganization, normalizeOrganizationsList } from '@/modules/organizations/utils/organizationHelpers';
import type { OrganizationApiItem, OrganizationUserApiItem } from '@/modules/organizations/types/organizationTypes';
import OrganizationUsersPanel from '@/modules/organizations/pages/partials/OrganizationUsersPanel';
import { getAccessRequests, normalizeAccessRequestList, type AccessRequestApiItem } from '@/modules/requests';
import RequestReviewModal from '@/modules/requests/pages/partials/RequestReviewModal';

const CFR_USERS_ROUTE = '/admin/cfr-users';
const ALL_ORGS = 'all' as const;
const ALL_PRODUCTS = 'all' as const;

type ScopedOrgUser = OrganizationUserApiItem & { orgId: number; orgName: string };

// "Pending" here means pending ACCESS REQUESTS (AccessRequest.status === 'pending') scoped to the
// selected organization -- auth.UserProduct/OrganizationUserApiItem has no pending/invited state
// of its own (memberStatus is only ever 'active' | 'inactive'), so a request row is the only real
// "awaiting approval" population this system tracks. Same org-scoping recipe already used by
// OrganizationRequestsPanel: fetch the flat global request list and filter client-side, since
// there is no per-organization requests endpoint.
const CFRUsersPage = () => {
  //#region Hooks
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel(CFR_USERS_ROUTE);
  const isReadOnly = accessLevel === 'readOnly';
  //#endregion

  //#region States
  const [organizations, setOrganizations] = useState<OrganizationApiItem[]>([]);
  const [orgId, setOrgId] = useState<number | typeof ALL_ORGS | null>(null);
  const [organization, setOrganization] = useState<OrganizationApiItem | null>(null);
  const [users, setUsers] = useState<ScopedOrgUser[]>([]);
  const [productFilter, setProductFilter] = useState<string>(ALL_PRODUCTS);
  const [requests, setRequests] = useState<AccessRequestApiItem[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingOrgData, setLoadingOrgData] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  //#endregion

  //#region Functions
  // Organization defaults to the first org loaded, same as before "All" existed -- "All" is an
  // explicit opt-in from the dropdown, not the default, since it fans out one request per
  // organization (GetOrganizationUsers has no bulk-across-organizations endpoint).
  const loadOrganizations = useCallback(async () => {
    try {
      const { resultData, statusCode } = await getOrganizations();
      const list = statusCode === 204 ? [] : normalizeOrganizationsList(resultData);
      setOrganizations(list);
      setOrgId((current) => current ?? list[0]?.orgId ?? null);
    } catch (error) {
      console.error('Error loading organizations:', error);
      showToast(typeof error === 'string' ? error : 'Failed to load organizations.', 'error');
    } finally {
      setLoadingOrgs(false);
    }
  }, [showToast]);

  const loadOrgScopedData = useCallback(async (id: number | typeof ALL_ORGS, orgList: OrganizationApiItem[]) => {
    setLoadingOrgData(true);
    try {
      if (id === ALL_ORGS) {
        const [usersByOrg, requestsResult] = await Promise.all([
          Promise.all(orgList.map(async (org) => {
            const usersResult = await getOrganizationUsers(org.orgId);
            const list = Array.isArray(usersResult.resultData) ? usersResult.resultData as OrganizationUserApiItem[] : [];
            return list.map((user): ScopedOrgUser => ({ ...user, orgId: org.orgId, orgName: org.orgName }));
          })),
          getAccessRequests(),
        ]);
        setOrganization(null);
        setUsers(usersByOrg.flat());
        const allRequests = requestsResult.statusCode === 204 ? [] : normalizeAccessRequestList(requestsResult.resultData);
        setRequests(allRequests);
      } else {
        const [orgResult, usersResult, requestsResult] = await Promise.all([
          getOrganizationById(id),
          getOrganizationUsers(id),
          getAccessRequests(),
        ]);
        const org = orgResult.statusCode === 204 ? null : normalizeOrganization(orgResult.resultData);
        setOrganization(org);
        const list = Array.isArray(usersResult.resultData) ? usersResult.resultData as OrganizationUserApiItem[] : [];
        setUsers(list.map((user): ScopedOrgUser => ({ ...user, orgId: id, orgName: org?.orgName ?? '' })));
        const allRequests = requestsResult.statusCode === 204 ? [] : normalizeAccessRequestList(requestsResult.resultData);
        setRequests(allRequests.filter((request) => request.organizationId === id));
      }
    } catch (error) {
      console.error('Error loading CFR users:', error);
      showToast(typeof error === 'string' ? error : 'Failed to load users.', 'error');
    } finally {
      setLoadingOrgData(false);
    }
  }, [showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    if (orgId !== null) void loadOrgScopedData(orgId, organizations);
  }, [orgId, organizations, loadOrgScopedData]);
  //#endregion

  //#region Derived data
  const orgOptions = useMemo(
    () => [
      { id: ALL_ORGS, value: 'All Organizations' },
      ...organizations.map((org) => ({ id: String(org.orgId), value: org.orgName })),
    ],
    [organizations],
  );

  const productOptions = useMemo(() => {
    const names = new Set<string>();
    users.forEach((user) => {
      (user.appNames ? user.appNames.split(', ').filter(Boolean) : []).forEach((name) => names.add(name));
    });
    return [
      { id: ALL_PRODUCTS, value: 'All Products' },
      ...Array.from(names).sort().map((name) => ({ id: name, value: name })),
    ];
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (productFilter === ALL_PRODUCTS) return users;
    return users.filter((user) => (user.appNames ? user.appNames.split(', ').filter(Boolean) : []).includes(productFilter));
  }, [users, productFilter]);

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === 'pending'),
    [requests],
  );

  const pendingColumns: DataTableColumn<AccessRequestApiItem>[] = [
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
      cell: (request) => <CommonButton variant="outline" size="sm" onClick={() => setSelectedRequestId(request.accessRequestId)}>Review</CommonButton>,
    },
  ];
  //#endregion

  //#region Handlers
  const handleUsersChanged = async () => {
    if (orgId !== null) await loadOrgScopedData(orgId, organizations);
  };

  const handleRequestResolved = async () => {
    if (orgId !== null) await loadOrgScopedData(orgId, organizations);
  };
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="CFR User" />

      {isReadOnly ? <ReadOnlyBanner featureName="CFR User" /> : null}

      <div className="flex flex-wrap gap-4">
        <div className="w-full max-w-xs">
          <Dropdown
            id="filterCFRUserOrganization"
            label="Organization"
            searchable
            clearable={false}
            value={orgId !== null ? String(orgId) : undefined}
            onValueChange={(value) => setOrgId(!value || value === ALL_ORGS ? ALL_ORGS : Number(value))}
            options={orgOptions}
            className="min-h-8"
          />
        </div>

        <div className="w-full max-w-xs">
          <Dropdown
            id="filterCFRUserProduct"
            label="Product"
            searchable
            clearable={false}
            value={productFilter}
            onValueChange={(value) => setProductFilter(value || ALL_PRODUCTS)}
            options={productOptions}
            className="min-h-8"
          />
        </div>
      </div>

      {loadingOrgs ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-busy="true" aria-label="Loading organizations">
          {Array.from({ length: 3 }).map((_, index) => <div key={index} className="admin-skeleton h-16 w-full rounded-[var(--radius-panel)]" />)}
        </div>
      ) : organizations.length === 0 ? (
        <EmptyState icon="🏢" title="No organizations yet" description="Add an organization before managing its users." />
      ) : (
        <>
          <Tabs
            activeId={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'active', label: 'Active Users', count: filteredUsers.length },
              { id: 'pending', label: 'Pending', count: pendingRequests.length },
            ]}
          />

          {loadingOrgData ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-busy="true" aria-label="Loading users">
              {Array.from({ length: 3 }).map((_, index) => <div key={index} className="admin-skeleton h-16 w-full rounded-[var(--radius-panel)]" />)}
            </div>
          ) : (
            <>
              <TabPanel id="active" activeId={activeTab}>
                {orgId !== null ? (
                  <OrganizationUsersPanel
                    orgId={orgId === ALL_ORGS ? undefined : orgId}
                    organization={organization ?? undefined}
                    users={filteredUsers}
                    onChanged={handleUsersChanged}
                    readOnly={isReadOnly}
                    showRoleColumn={false}
                    showLinkedOnColumn={false}
                  />
                ) : null}
              </TabPanel>

              <TabPanel id="pending" activeId={activeTab}>
                {pendingRequests.length === 0 ? (
                  <EmptyState icon="📥" title="No pending requests" description="Pending access requests from this organization will appear here." />
                ) : (
                  <DataTable
                    data={pendingRequests}
                    columns={pendingColumns}
                    getRowId={(request) => String(request.accessRequestId)}
                    initialSort={[{ id: 'submittedAt', desc: true }]}
                    exportFileName="cfr-user-pending-requests"
                    exportTitle="CFR User — Pending Requests"
                    emptyMessage="No pending requests."
                  />
                )}
              </TabPanel>
            </>
          )}
        </>
      )}

      <RequestReviewModal
        accessRequestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
        onResolved={handleRequestResolved}
      />
    </div>
  );
  //#endregion
};

export default CFRUsersPage;
