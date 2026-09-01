import { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { Tabs, TabPanel } from '@app/components/Tabs';
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

const OrganizationDetailPage = () => {
  //#region Hooks
  const { orgId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const startInEdit = Boolean((location.state as { edit?: boolean } | undefined)?.edit);
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
  //#endregion

  if (notFound) return <Navigate to="/admin/organizations" replace />;

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={organization?.orgName ?? 'Organization'}
        action={(
          <CommonButton variant="headerSecondary" size="sm" iconLeft={<ArrowLeft size={14} />} onClick={() => navigate('/admin/organizations')}>
            Back to Organizations
          </CommonButton>
        )}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-busy="true" aria-label="Loading organization">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="admin-skeleton h-16 w-full rounded-[var(--radius-panel)]" />)}
        </div>
      ) : organization ? (
        <>
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
            <OrganizationProfilePanel organization={organization} startInEdit={startInEdit} onSaved={handleSavedProfile} />
          </TabPanel>

          <TabPanel id="users" activeId={activeTab}>
            <OrganizationUsersPanel users={users} />
          </TabPanel>

          <TabPanel id="products" activeId={activeTab}>
            <OrganizationProductsPanel orgId={numericOrgId} orgName={organization.orgName} products={products} onChanged={handleProductsChanged} />
          </TabPanel>

          <TabPanel id="licenses" activeId={activeTab}>
            <EmptyState icon="🔑" title="Licenses not yet available" description="License management for organizations has not been implemented in the backend yet." />
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
