import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import {
  CommonCheckbox,
  DatePicker,
  Dropdown,
  InputField,
  MandatoryIndicator,
  RichTextEditor,
} from '@app/components/formControls';
import { confirmAction } from '@/modules/lib/confirm';
import { getLiveOrganizations } from '@/modules/organizations/liveOrganizations/services/liveOrganizationsService';
import type { LiveOrganizationApiItem } from '@/modules/organizations/liveOrganizations/types/liveOrganizationTypes';
import { createLicense, getProductById } from '../../services/productService';
import type { ProductApiItem } from '../../types/productTypes';
import { PRODUCTS_PATHS, parseProductIdFromState } from '../../utils/productHelpers';
import { validateLicenseForm } from '../../validator/productValidation';

const STATUS_OPTIONS = [
  { id: 'Active', value: 'Active' },
  { id: 'Suspended', value: 'Suspended' },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function inDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

const AddLicense = () => {
  //#region Hooks
  const location = useLocation();
  const productId = parseProductIdFromState(location.state);
  const navigate = useNavigate();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [product, setProduct] = useState<ProductApiItem | null>(null);
  const [organizations, setOrganizations] = useState<LiveOrganizationApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [orgId, setOrgId] = useState('');
  const [licenseStatus, setLicenseStatus] = useState('Active');
  const [unlimitedSeats, setUnlimitedSeats] = useState(false);
  const [seats, setSeats] = useState(10);
  const [activationDate, setActivationDate] = useState(today());
  const [expiryDate, setExpiryDate] = useState(inDays(365));
  const [customMessage, setCustomMessage] = useState('');
  const [touched, setTouched] = useState(false);
  //#endregion

  //#region Functions
  const goToDetails = () => {
    if (productId) {
      navigate(PRODUCTS_PATHS.details, { state: { productId } });
      return;
    }
    navigate(PRODUCTS_PATHS.list);
  };

  const loadPage = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      const [productRes, orgRes] = await Promise.all([getProductById(productId), getLiveOrganizations()]);
      const loadedProduct = (productRes.resultData as ProductApiItem | null) ?? null;
      const loadedOrgs = orgRes.statusCode === 204 || !Array.isArray(orgRes.resultData)
        ? []
        : orgRes.resultData as LiveOrganizationApiItem[];
      setProduct(loadedProduct);
      setOrganizations(loadedOrgs);
      if (loadedProduct) {
        setTitle(`${loadedProduct.productName} — License`);
      }
      if (loadedOrgs[0]) {
        setOrgId(String(loadedOrgs[0].orgId));
      }
    } catch (error) {
      console.error('Error loading create license page:', error);
      showToast(typeof error === 'string' ? error : 'Failed to load create license page.', 'error');
      setProduct(null);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [productId, showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    if (!productId) {
      navigate(PRODUCTS_PATHS.list, { replace: true });
      return;
    }
    void loadPage();
  }, [productId, loadPage, navigate]);
  //#endregion

  if (!productId) {
    return null;
  }

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
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Product Not Found</h2>
        <p className="text-sm text-[var(--text-muted)]">Open Create License from a product so the product id is passed in location state.</p>
        <CommonButton variant="outline" size="sm" onClick={() => navigate(PRODUCTS_PATHS.list)}>Back to Products</CommonButton>
      </div>
    );
  }

  const handleCancel = async () => {
    if (touched) {
      const confirmed = await confirmAction({
        title: 'Discard this license?',
        description: 'You have unsaved license details. Leaving now will discard them.',
        confirmLabel: 'Discard license',
        tone: 'danger',
      });
      if (!confirmed) return;
    }
    goToDetails();
  };

  const handleSubmit = async () => {
    setTouched(true);
    const messages = validateLicenseForm({
      title,
      orgId,
      activationDate,
      expiryDate,
      unlimitedSeats,
      seats,
    });
    if (messages.length > 0) {
      showToast(messages, 'error');
      return;
    }

    setSaving(true);
    try {
      const seatNote = unlimitedSeats ? 'Unlimited seats (site license).' : `${seats} seats.`;
      const remarks = [title.trim(), seatNote, customMessage.trim()].filter(Boolean).join('\n');
      await createLicense({
        licenseId: 0,
        organizationProductId: 0,
        orgId: Number(orgId),
        productId,
        licenseType: unlimitedSeats ? 'Site' : 'Subscription',
        activationDate,
        expiryDate,
        licenseStatus,
        assignStatus: 'Active',
        remarks: remarks || undefined,
      });
      showToast('License added successfully.', 'success');
      goToDetails();
    } catch (error) {
      console.error('Error creating license:', error);
      showToast(typeof error === 'string' ? error : 'Failed to create license.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Create License" action={<MandatoryIndicator variant="brand" />} />

      {organizations.length === 0 ? (
        <section className="admin-panel-card p-4">
          <p className="text-sm text-[var(--text-muted)]">This product has no customers to license yet — assign it to an organization first.</p>
          <div className="mt-3">
            <CommonButton variant="outline" iconLeft={<X size={14} />} onClick={() => void handleCancel()}>Cancel</CommonButton>
          </div>
        </section>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
          noValidate
          className="flex flex-col gap-3"
        >
          <section className="admin-panel-card overflow-hidden">
            <div className="flex flex-col divide-y divide-[var(--line-soft)]">
              <div>
                <div className="admin-panel-card__header"><h2 className="panel-title">License Details</h2></div>
                <div className="grid gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-3">
                  <InputField
                    label="Title"
                    required
                    autoFocus
                    placeholder="Enter title"
                    value={title}
                    onChange={(event) => { setTitle(event.target.value); setTouched(true); }}
                    error={touched && !title.trim() ? 'Title is required.' : undefined}
                    wrapperClassName="lg:col-span-3"
                  />
                  <Dropdown
                    label="Customer"
                    required
                    placeholder="Select customer"
                    value={orgId}
                    onValueChange={(value) => { setOrgId(value ?? ''); setTouched(true); }}
                    options={organizations.map((org) => ({
                      id: String(org.orgId),
                      value: `${org.orgName} (ORG-${String(org.orgId).padStart(4, '0')})`,
                    }))}
                    searchable
                    clearable={false}
                    error={touched && !orgId ? 'Customer is required.' : undefined}
                  />
                  <Dropdown
                    label="Status"
                    required
                    placeholder="Select status"
                    value={licenseStatus}
                    onValueChange={(value) => { setLicenseStatus(value ?? 'Active'); setTouched(true); }}
                    options={STATUS_OPTIONS}
                    searchable={false}
                    clearable={false}
                  />
                  <div className="flex flex-col gap-1.5">
                    <InputField
                      label="Seats"
                      required
                      type="number"
                      min={1}
                      placeholder="Enter seats"
                      value={seats}
                      disabled={unlimitedSeats}
                      onChange={(event) => { setSeats(Math.max(1, Number(event.target.value) || 1)); setTouched(true); }}
                      error={touched && !unlimitedSeats && seats < 1 ? 'Seats is required.' : undefined}
                    />
                    <CommonCheckbox
                      label="Unlimited seats (site license)"
                      checked={unlimitedSeats}
                      onCheckedChange={(checked) => { setUnlimitedSeats(checked); setTouched(true); }}
                    />
                  </div>
                  <DatePicker
                    label="Start Date"
                    required
                    placeholder="Select start date"
                    value={activationDate}
                    outputFormat="yyyy-MM-dd"
                    displayFormat="MM/dd/yyyy"
                    onChange={(value) => { setActivationDate(value); setTouched(true); }}
                  />
                  <DatePicker
                    label="Expiry Date"
                    required
                    placeholder="Select expiry date"
                    value={expiryDate}
                    outputFormat="yyyy-MM-dd"
                    displayFormat="MM/dd/yyyy"
                    onChange={(value) => { setExpiryDate(value); setTouched(true); }}
                  />
                </div>
              </div>

              <div>
                <div className="admin-panel-card__header"><h2 className="panel-title">Custom Message</h2></div>
                <div className="p-3">
                  <RichTextEditor
                    label="Custom Message"
                    hideLabel
                    placeholder="Start typing here..."
                    value={customMessage}
                    onChange={(value) => { setCustomMessage(value); setTouched(true); }}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="admin-sticky-footer">
            <CommonButton variant="outline" iconLeft={<X size={14} />} onClick={() => void handleCancel()}>Cancel</CommonButton>
            <CommonButton variant="primary" iconLeft={<Save size={14} />} type="submit" loading={saving}>Save</CommonButton>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddLicense;
