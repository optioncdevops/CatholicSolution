import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, RefreshCw } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { Tabs, TabPanel } from '@app/components/Tabs';
import { useAdminData } from '@/modules/AdminDataContext';
import { getProductWarnings } from '../../validator/productValidation';
import { getProductById, updateProduct } from '../../services/productService';
import type { ProductApiItem, ProductInputPayload } from '../../types/productTypes';
import { ProductWarningsBanner } from './ProductWarningsBanner';
import { ProductStatusDialog } from './ProductStatusDialog';
import { ProductDetailsTab } from './ProductDetailsTab';
import { ProductCustomersTab } from './ProductCustomersTab';
import { ProductInvoiceDetailsTab } from './ProductInvoiceDetailsTab';
import { ProductInvoiceHistoryTab } from './ProductInvoiceHistoryTab';
import { deriveProductStatus, getProductTheme, resolveProductLogoUrl } from '../../utils/productHelpers';
import type { AdminApplication, ProductStatus } from '@/modules/types';

export function ProductDetailPage() {
  //#region Hooks
  const { appId, productId } = useParams();
  const id = productId ?? appId;
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
    if (!id) {
      setLoading(false);
      return;
    }

    const numericId = Number(id);
    if (!isNaN(numericId) && numericId > 0) {
      try {
        const res = await getProductById(numericId);
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
    } else {
      setLoading(false);
    }
  }, [id, showToast]);

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
        <span className="text-4xl">📦</span>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Product Not Found</h2>
        <p className="text-sm text-[var(--text-muted)]">The requested product could not be located in the database.</p>
        <CommonButton variant="outline" size="sm" onClick={() => navigate('/admin/products')}>Back to Products</CommonButton>
      </div>
    );
  }

  const theme = getProductTheme(product.productName, product.subCategoryName);

  const app: AdminApplication = {
    id: String(product.productId),
    name: product.productName,
    shortName: product.productName,
    category: product.subCategoryName || 'General',
    icon: product.logoUrl || theme.icon,
    gradient: theme.gradient,
    description: product.prodDescription || '',
    features: product.features ?? [],
    productionUrl: product.externalPageUrl || '',
    ownership: 'first-party',
    deploymentModel: 'external-saas',
    licenseType: product.defaultAccessDays === 0 ? 'free' : 'licensed',
    navigationTarget: 'same-tab',
    status: deriveProductStatus(product),
    registryRef: `reg_app_${String(product.productId).padStart(4, '0')}`,
    sourceLocation: `SaaS_Apps/${product.productName.toLowerCase().replace(/\s+/g, '-')}`,
    updatedAt: product.updatedDate || product.createdDate,
  };

  const warnings = getProductWarnings(app, [app]);
  const customerCount = organizations.filter((org) => org.appIds.includes(app.id)).length;

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={app.name}
        icon={
          product.logoUrl ? (
            <img
              src={resolveProductLogoUrl(product.logoUrl) || product.logoUrl}
              alt=""
              className="size-9 shrink-0 rounded-xl object-cover"
              aria-hidden="true"
            />
          ) : (
            <span
              className="grid size-9 shrink-0 place-items-center rounded-xl text-base text-white"
              style={{ background: app.gradient }}
              aria-hidden="true"
            >
              {app.icon}
            </span>
          )
        }
        action={(
          <div className="flex flex-wrap items-center gap-2">
            <CommonButton variant="headerSecondary" iconLeft={<RefreshCw size={14} />} onClick={() => setChangingStatus(true)}>Change Status</CommonButton>
            <CommonButton variant="headerSecondary" iconLeft={<Pencil size={14} />} onClick={() => navigate(`/admin/products/${product.productId}/edit`)}>Edit</CommonButton>
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
        <ProductCustomersTab app={app} />
      </TabPanel>

      <TabPanel id="invoice-details" activeId={activeTab}>
        <ProductInvoiceDetailsTab app={app} />
      </TabPanel>

      <TabPanel id="invoice-history" activeId={activeTab}>
        <ProductInvoiceHistoryTab app={app} />
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
}

export default ProductDetailPage;
