import { useCallback, useEffect, useMemo, useState } from 'react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@shared/auth/hooks/useFeatureAccessLevel';
import { Dropdown, MultiSelect } from '@app/components/formControls';
import { Tabs, TabPanel } from '@app/components/Tabs';
import { getOrganizations } from '@/modules/organizations/services/organizationsService';
import { normalizeOrganizationsList } from '@/modules/organizations/utils/organizationHelpers';
import type { OrganizationApiItem, OrganizationUserApiItem } from '@/modules/organizations/types/organizationTypes';
import OrganizationUsersPanel from '@/modules/organizations/pages/partials/OrganizationUsersPanel';
import { getProducts } from '@/modules/cfrproducts/services/productService';
import type { ProductApiItem } from '@/modules/cfrproducts/types/productTypes';
import { getCFRUsers } from '../services/cfrUsersService';
import type { CFRUserApiItem } from '../types/cfrUsersTypes';

const CFR_USERS_ROUTE = '/admin/cfr-users';
const ALL_ORGS = 'all' as const;

type ScopedOrgUser = OrganizationUserApiItem & { orgId: number; orgName: string };

// Users/GetCFRUsers (hosted on the existing Users/Administration controller, not a separate
// service) -- Status here comes from [auth].[User].[AuthOId]: populated -> "active", NULL ->
// "pending". A single call returns every organization when no orgId is sent, so there is no
// per-organization fan-out here.
const CFRUsersPage = () => {
  //#region Hooks
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel(CFR_USERS_ROUTE);
  const isReadOnly = accessLevel === 'readOnly';
  //#endregion

  //#region States
  const [organizations, setOrganizations] = useState<OrganizationApiItem[]>([]);
  const [products, setProducts] = useState<ProductApiItem[]>([]);
  const [orgId, setOrgId] = useState<number | typeof ALL_ORGS | null>(null);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [users, setUsers] = useState<ScopedOrgUser[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingOrgData, setLoadingOrgData] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  //#endregion

  //#region Functions
  // Organization defaults to the first org loaded -- "All" is an explicit opt-in from the dropdown.
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

  const loadUsers = useCallback(async (
    id: number | typeof ALL_ORGS, 
    tabId: string, 
    prods: string[]
  ) => {
    setLoadingOrgData(true);
    try {
      const isAuth = tabId === 'active' ? 1 : 0;
      const { resultData, statusCode } = await getCFRUsers(
        id === ALL_ORGS ? undefined : id, 
        isAuth,
        prods.length > 0 ? prods.join(',') : undefined
      );
      
      const data = resultData as { users?: CFRUserApiItem[], activeCount?: number, pendingCount?: number };
      const rawUsers = data?.users ?? [];
      const list = statusCode === 204 || !Array.isArray(rawUsers) ? [] : rawUsers;
      
      setUsers(list.map((user): ScopedOrgUser => ({
        authUserId: user.authUserId,
        email: user.email ?? '',
        fullName: user.fullName,
        roleName: user.roleName,
        memberStatus: user.status,
        linkedDate: user.linkedDate,
        appCount: user.appCount,
        appNames: user.appNames,
        orgId: user.orgId,
        orgName: user.orgName,
      })));
      
      setActiveCount(data?.activeCount ?? 0);
      setPendingCount(data?.pendingCount ?? 0);
    } catch (error) {
      console.error('Error loading CFR users:', error);
      showToast(typeof error === 'string' ? error : 'Failed to load users.', 'error');
    } finally {
      setLoadingOrgData(false);
    }
  }, [showToast]);
  //#endregion

  //#region Effects
  const loadProducts = useCallback(async () => {
    try {
      const { resultData, statusCode } = await getProducts();
      if (statusCode !== 204 && Array.isArray(resultData)) {
        setProducts(resultData as ProductApiItem[]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Failed to load products.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    void loadOrganizations();
    void loadProducts();
  }, [loadOrganizations, loadProducts]);

  useEffect(() => {
    if (orgId !== null) void loadUsers(orgId, activeTab, productIds);
  }, [orgId, activeTab, productIds, loadUsers]);
  //#endregion

  //#region Derived data
  const orgOptions = useMemo(
    () => [
      { id: ALL_ORGS, value: 'All Organizations' },
      ...organizations.map((org) => ({ id: String(org.orgId), value: org.orgName })),
    ],
    [organizations],
  );

  const productOptions = useMemo(
    () => products.map((prod) => ({ id: String(prod.productId), value: prod.productName })),
    [products],
  );

  //#endregion

  //#region Handlers
  const handleUsersChanged = async () => {
    if (orgId !== null) await loadUsers(orgId, activeTab, productId);
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
          <MultiSelect
            id="filterCFRUserProduct"
            label="Products"
            searchable
            value={productIds}
            onValueChange={(value) => setProductIds(value)}
            options={productOptions}
            placeholder="All Products"
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
              { id: 'active', label: 'Active Users', count: activeCount },
              { id: 'pending', label: 'Pending', count: pendingCount },
            ]}
          />

          {loadingOrgData ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-busy="true" aria-label="Loading users">
              {Array.from({ length: 3 }).map((_, index) => <div key={index} className="admin-skeleton h-16 w-full rounded-[var(--radius-panel)]" />)}
            </div>
          ) : (
            <>
              <TabPanel id="active" activeId={activeTab}>
                <OrganizationUsersPanel
                  users={users}
                  onChanged={handleUsersChanged}
                  readOnly={isReadOnly}
                  showRoleColumn={false}
                  showLinkedOnColumn={false}
                  showActionsColumn={false}
                  showOrganizationColumn={true}
                  exportFileName="CFR_User"
                  exportTitle="CFR User"
                />
              </TabPanel>

              <TabPanel id="pending" activeId={activeTab}>
                <OrganizationUsersPanel
                  users={users}
                  onChanged={handleUsersChanged}
                  readOnly={isReadOnly}
                  showRoleColumn={false}
                  showLinkedOnColumn={false}
                  showActionsColumn={false}
                  showOrganizationColumn={true}
                  exportFileName="CFR_User_Pending"
                  exportTitle="CFR User - Pending"
                />
              </TabPanel>
            </>
          )}
        </>
      )}
    </div>
  );
  //#endregion
};

export default CFRUsersPage;
