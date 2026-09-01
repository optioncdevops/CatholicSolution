import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Pencil, RefreshCw } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { Tabs, TabPanel } from '@app/components/Tabs';
import { useAdminData } from '@/modules/AdminDataContext';
import { getProductWarnings } from '../validator/productValidation';
import { getProductById, getProducts, updateProduct } from '../services/productService';
import type { ProductApiItem, ProductInputPayload } from '../types/productTypes';
import { ProductWarningsBanner } from './partials/ProductWarningsBanner';
import { ProductStatusDialog } from './partials/ProductStatusDialog';
import { ProductDetailsTab } from './partials/ProductDetailsTab';
import { CustomerDetails } from './CustomerDetails';
import { LicenseDetails } from './LicenseDetails';
import { LicenseHistory } from './LicenseHistory';
import {
  DEFAULT_PRODUCT_GRADIENT,
  DEFAULT_PRODUCT_ICON,
  PRODUCTS_PATHS,
  normalizeProductList,
  parseProductIdFromState,
  resolveProductLogoUrl,
  toAdminApplication,
  toProductSlug,
} from '../utils/productHelpers';
import type { ProductStatus } from '@/modules/types';

const ProductDetails = () => {
  //#region Hooks
  const location = useLocation();
  const params = useParams<{ slug?: string }>();
  const stateProductId = parseProductIdFromState(location.state);
  const navigate = useNavigate();
  const { organizations } = useAdminData();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [product, setProduct] = useState<ProductApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [changingStatus, setChangingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProductStatus | null>(null);
  //#endregion

  //#region Functions
  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      let resolvedId = stateProductId;

      if (!resolvedId && params.slug) {
        const numeric = Number(params.slug);
        if (Number.isInteger(numeric) && numeric > 0) {
          resolvedId = numeric;
        } else {
          const listRes = await getProducts();
          const items = normalizeProductList(listRes.resultData);
          const found = items.find(
            (p) => toProductSlug(p.productName) === params.slug || String(p.productId) === params.slug,
          );
          if (found) {
            resolvedId = found.productId;
          }
        }
      }

      if (!resolvedId) {
        setProduct(null);
        return;
      }

      const res = await getProductById(resolvedId);
      if (res.resultData) {
        setProduct(res.resultData as ProductApiItem);
      } else {
        setProduct(null);
      }
    } catch (err) {
      console.error('Error fetching product by ID:', err);
      showToast('Failed to load product details.', 'error');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [stateProductId, params.slug, showToast]);

  const handleConfirmStatus = async (status: ProductStatus) => {
    if (!product) return;
    try {
      const payload: ProductInputPayload = {
        productId: product.productId,
        productName: product.productName,
        subCategoryName: product.subCategoryName,
        prodDescription: product.prodDescription,
        externalPageUrl: product.externalPageUrl,
        defaultAccessDays: product.defaultAccessDays,
        isActive: status === 'active',
        isAvailable: status !== 'coming-soon',
      };
      await updateProduct(payload);
      await loadProduct();
      showToast(`${product.productName} status changed to ${status.replace('-', ' ')}.`);
    } catch (error) {
      showToast(typeof error === 'string' ? error : 'Failed to change status', 'error');
    } finally {
      setChangingStatus(false);
      setPendingStatus(null);
    }
  };
  //#endregion

  //#region Effects
  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);
  //#endregion

  if (loading) {
    return (
      <div className="admin-reveal flex flex-col gap-4" aria-busy="true">
        <div className="admin-skeleton h-12 w-full rounded-[var(--radius-panel)]" />
        <div className="admin-skeleton h-64 w-full rounded-[var(--radius-panel)]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="admin-reveal flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="text-4xl">{DEFAULT_PRODUCT_ICON}</span>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Product Not Found</h2>
        <p className="text-sm text-[var(--text-muted)]">The requested product could not be located in the database.</p>
        <CommonButton variant="outline" size="sm" onClick={() => navigate(PRODUCTS_PATHS.list)}>Back to Products</CommonButton>
      </div>
    );
  }

  const app = toAdminApplication(product);
  const logoSrc = resolveProductLogoUrl(product.logoUrl);
  const warnings = getProductWarnings(app, [app]);
  const customerCount = organizations.filter((org) => org.appIds.includes(app.id)).length;
  const slug = toProductSlug(product.productName) || String(product.productId);

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={app.name}
        icon={
          logoSrc ? (
            <img
              src={logoSrc}
              alt=""
              className="size-9 shrink-0 rounded-xl object-cover"
              aria-hidden="true"
            />
          ) : (
            <span
              className="grid size-9 shrink-0 place-items-center rounded-xl text-base text-white"
              style={{ background: DEFAULT_PRODUCT_GRADIENT }}
              aria-hidden="true"
            >
              {DEFAULT_PRODUCT_ICON}
            </span>
          )
        }
        action={(
          <div className="flex flex-wrap items-center gap-2">
            <CommonButton variant="headerSecondary" iconLeft={<RefreshCw size={14} />} onClick={() => setChangingStatus(true)}>Change Status</CommonButton>
            <CommonButton
              variant="headerSecondary"
              iconLeft={<Pencil size={14} />}
              onClick={() => navigate(PRODUCTS_PATHS.edit(slug), { state: { productId: product.productId } })}
            >
              Edit
            </CommonButton>
          </div>
        )}
      />

      <ProductWarningsBanner warnings={warnings} />

      <Tabs
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'details', label: 'Product Details' },
          { id: 'customers', label: 'Customers', count: customerCount },
          { id: 'invoice-details', label: 'License Details' },
          { id: 'invoice-history', label: 'License History' },
        ]}
      />

      <TabPanel id="details" activeId={activeTab}>
        <ProductDetailsTab app={app} />
      </TabPanel>

      <TabPanel id="customers" activeId={activeTab}>
        <CustomerDetails app={app} />
      </TabPanel>

      <TabPanel id="invoice-details" activeId={activeTab}>
        <LicenseDetails app={app} />
      </TabPanel>

      <TabPanel id="invoice-history" activeId={activeTab}>
        <LicenseHistory app={app} />
      </TabPanel>

      <ProductStatusDialog
        app={changingStatus ? app : null}
        pendingStatus={pendingStatus}
        onSelectStatus={setPendingStatus}
        onClose={() => { setChangingStatus(false); setPendingStatus(null); }}
        onConfirm={handleConfirmStatus}
      />
    </div>
  );
};

export default ProductDetails;
