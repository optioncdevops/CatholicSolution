import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@shared/auth/hooks/useFeatureAccessLevel';
import { CommonButton } from '@app/components/buttons';
import { Tabs, TabPanel } from '@app/components/Tabs';
import { PRODUCTS_PATHS } from '@/modules/cfrproducts';
import {
  getOrganizationById,
  getOrganizationProducts,
  getOrganizationUsers,
} from '../services/organizationsService';
import { normalizeOrganization } from '../utils/organizationHelpers';
import type { OrganizationApiItem, OrganizationProductApiItem, OrganizationUserApiItem } from '../types/organizationTypes';
import OrganizationProfilePanel from './partials/OrganizationProfilePanel';
import OrganizationUsersPanel from './partials/OrganizationUsersPanel';
import OrganizationProductsPanel from './partials/OrganizationProductsPanel';
import OrganizationRequestsPanel from './partials/OrganizationRequestsPanel';
import OrganizationLicensesPanel from './partials/OrganizationLicensesPanel';

const OrganizationDetailPage = () => {
  //#region Hooks
  const { orgId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel('/admin/organizations');
  const isReadOnly = accessLevel === 'readOnly';
  const startInEdit = Boolean((location.state as { edit?: boolean } | undefined)?.edit);

  const navState = location.state as {
    fromProductId?: number | string;
    fromProductName?: string;
    fromTab?: string;
    edit?: boolean;
  } | null;

  const fromProductId = useMemo(() => {
    const rawId = navState?.fromProductId ?? sessionStorage.getItem('cfr_from_product_id');
    const parsed = Number(rawId);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [navState?.fromProductId]);

  const fromProductName = useMemo(() => {
    return navState?.fromProductName ?? sessionStorage.getItem('cfr_from_product_name') ?? '';
  }, [navState?.fromProductName]);

  const fromTab = navState?.fromTab ?? 'organizations';
  //#endregion

  //#region States
  const [organization, setOrganization] = useState<OrganizationApiItem | null>(null);
  const [users, setUsers] = useState<OrganizationUserApiItem[]>([]);
  const [products, setProducts] = useState<OrganizationProductApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  //#endregion

  const numericOrgId = Number(orgId);

  //#region Functions
  const loadOrganization = useCallback(async () => {
    try {
      const { resultData, statusCode } = await getOrganizationById(numericOrgId);
      if (statusCode === 204 || !resultData) {
        setNotFound(true);
        return;
      }
      setOrganization(normalizeOrganization(resultData));
    } catch (error) {
      console.error('Error loading organization:', error);
      showToast('Failed to load organization.', 'error');
      setNotFound(true);
    }
  }, [numericOrgId, showToast]);

  const loadUsers = useCallback(async () => {
    try {
      const { resultData, statusCode } = await getOrganizationUsers(numericOrgId);
      setUsers(statusCode === 204 || !Array.isArray(resultData) ? [] : resultData as OrganizationUserApiItem[]);
    } catch (error) {
      console.error('Error loading organization users:', error);
      showToast('Failed to load users.', 'error');
    }
  }, [numericOrgId, showToast]);

  const loadProducts = useCallback(async () => {
    try {
      const { resultData, statusCode } = await getOrganizationProducts(numericOrgId);
      setProducts(statusCode === 204 || !Array.isArray(resultData) ? [] : resultData as OrganizationProductApiItem[]);
    } catch (error) {
      console.error('Error loading organization products:', error);
      showToast('Failed to load products.', 'error');
    }
  }, [numericOrgId, showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!numericOrgId || numericOrgId <= 0) {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const [orgResult, usersResult, productsResult] = await Promise.all([
          getOrganizationById(numericOrgId),
          getOrganizationUsers(numericOrgId),
          getOrganizationProducts(numericOrgId),
        ]);
        if (cancelled) return;

        if (orgResult.statusCode === 204 || !orgResult.resultData) {
          setNotFound(true);
          return;
        }

        setOrganization(normalizeOrganization(orgResult.resultData));
        setUsers(Array.isArray(usersResult.resultData) ? usersResult.resultData as OrganizationUserApiItem[] : []);
        setProducts(Array.isArray(productsResult.resultData) ? productsResult.resultData as OrganizationProductApiItem[] : []);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading organization detail:', error);
        showToast('Failed to load organization.', 'error');
        setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [numericOrgId, showToast]);
  //#endregion

  //#region Handlers
  const handleSavedProfile = async () => {
    await loadOrganization();
  };

  const handleProductsChanged = async () => {
    await Promise.all([loadProducts(), loadOrganization()]);
  };

  const handleUsersChanged = async () => {
    await Promise.all([loadUsers(), loadOrganization()]);
  };
  const handleBackToProducts = () => {
    sessionStorage.removeItem('cfr_from_product_id');
    sessionStorage.removeItem('cfr_from_product_name');
    if (fromProductId) {
      navigate(PRODUCTS_PATHS.details, {
        state: {
          productId: fromProductId,
          tab: fromTab === 'organizations' ? 'customers' : fromTab,
        },
      });
    } else {
      navigate(PRODUCTS_PATHS.list);
    }
  };

  const handleBackToOrganizations = () => {
    sessionStorage.removeItem('cfr_from_product_id');
    sessionStorage.removeItem('cfr_from_product_name');
    navigate('/admin/organizations');
  };
  //#endregion

  if (notFound) return <Navigate to="/admin/organizations" replace />;

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={organization?.orgName ?? 'Organization'}
        action={(
          <div className="flex flex-wrap items-center gap-2">
            {fromProductId ? (
              <CommonButton
                variant="headerSecondary"
                size="sm"
                iconLeft={<ArrowLeft size={14} />}
                onClick={handleBackToProducts}
                title={fromProductName ? `Back to ${fromProductName}` : undefined}
              >
                Back to Products
              </CommonButton>
            ) : null}
            <CommonButton
              variant="headerSecondary"
              size="sm"
              iconLeft={<ArrowLeft size={14} />}
              onClick={handleBackToOrganizations}
            >
              Back to Organizations
            </CommonButton>
          </div>
        )}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-busy="true" aria-label="Loading organization">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="admin-skeleton h-16 w-full rounded-[var(--radius-panel)]" />)}
        </div>
      ) : organization ? (
        <>
          {isReadOnly ? <ReadOnlyBanner featureName="Organizations" /> : null}

          <Tabs
            activeId={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'profile', label: 'Profile' },
              { id: 'users', label: 'Users', count: users.length },
              { id: 'products', label: 'Products', count: products.length },
              { id: 'licenses', label: 'Licenses' },
              { id: 'requests', label: 'Requests' },
            ]}
          />

          <TabPanel id="profile" activeId={activeTab}>
            <OrganizationProfilePanel organization={organization} startInEdit={startInEdit} onSaved={handleSavedProfile} readOnly={isReadOnly} />
          </TabPanel>

          <TabPanel id="users" activeId={activeTab}>
            <OrganizationUsersPanel orgId={numericOrgId} organization={organization} users={users} onChanged={handleUsersChanged} readOnly={isReadOnly} />
          </TabPanel>

          <TabPanel id="products" activeId={activeTab}>
            <OrganizationProductsPanel orgId={numericOrgId} orgName={organization.orgName} products={products} onChanged={handleProductsChanged} readOnly={isReadOnly} />
          </TabPanel>

          <TabPanel id="licenses" activeId={activeTab}>
            <OrganizationLicensesPanel orgId={numericOrgId} />
          </TabPanel>

          <TabPanel id="requests" activeId={activeTab}>
            <OrganizationRequestsPanel orgId={numericOrgId} />
          </TabPanel>
        </>
      ) : null}
    </div>
  );
  //#endregion
};

export default OrganizationDetailPage;
