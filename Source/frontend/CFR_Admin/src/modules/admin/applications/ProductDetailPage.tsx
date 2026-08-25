import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Pencil, RefreshCw } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { useAdminData } from '../AdminDataContext';
import { Tabs, TabPanel } from '@app/components/Tabs';
import { getProductWarnings } from './productValidation';
import { ProductWarningsBanner } from './ProductWarningsBanner';
import { ProductStatusDialog } from './ProductStatusDialog';
import { ProductDetailsTab } from './ProductDetailsTab';
import { ProductCustomersTab } from './ProductCustomersTab';
import { ProductInvoiceDetailsTab } from './ProductInvoiceDetailsTab';
import { ProductInvoiceHistoryTab } from './ProductInvoiceHistoryTab';
import type { ProductStatus } from '../types';

export function ProductDetailPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { getApplication, applications, organizations, setApplicationStatus } = useAdminData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [changingStatus, setChangingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProductStatus | null>(null);

  const app = appId ? getApplication(appId) : undefined;
  if (!app) return <Navigate to="/admin/applications" replace />;

  const warnings = getProductWarnings(app, applications);
  const customerCount = organizations.filter((org) => org.appIds.includes(app.id)).length;

  const handleConfirmStatus = (status: ProductStatus) => {
    setApplicationStatus(app.id, status);
    showToast(`${app.name} status changed to ${status.replace('-', ' ')} ✓`);
    setChangingStatus(false);
    setPendingStatus(null);
  };

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={app.name}
        icon={<span className="grid size-9 shrink-0 place-items-center rounded-xl text-base text-white" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>}
        action={(
          <div className="flex flex-wrap items-center gap-2">
            <CommonButton variant="headerSecondary" iconLeft={<RefreshCw size={14} />} onClick={() => setChangingStatus(true)}>Change Status</CommonButton>
            <CommonButton variant="headerSecondary" iconLeft={<Pencil size={14} />} onClick={() => navigate(`/admin/applications/${app.id}/edit`)}>Edit</CommonButton>
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
          { id: 'invoice-details', label: 'Invoice Details' },
          { id: 'invoice-history', label: 'Invoice History' },
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
