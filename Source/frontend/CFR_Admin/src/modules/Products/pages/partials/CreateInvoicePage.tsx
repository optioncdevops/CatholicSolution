import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { CommonCheckbox, DatePicker, Dropdown, InputField, MandatoryIndicator, RichTextEditor } from '@app/components/formControls';
import { useAdminData } from '@/modules/AdminDataContext';
import { confirmAction } from '@/modules/lib/confirm';
import type { License, LicenseStatus } from '@/modules/types';

const STATUS_OPTIONS: Array<{ id: LicenseStatus; value: string }> = [
  { id: 'active', value: 'Active' },
  { id: 'suspended', value: 'Suspended' },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function inDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

export function CreateInvoicePage() {
  const { appId, productId } = useParams();
  const id = productId ?? appId;
  const navigate = useNavigate();
  const { getApplication, organizations, addLicense } = useAdminData();
  const { showToast } = useToast();

  const app = id ? getApplication(id) : undefined;
  const licenseTabPath = `/admin/products/${id}`;

  const productCustomers = organizations.filter((org) => org.appIds.includes(id ?? ''));

  const [title, setTitle] = useState(app ? `${app.name} — License` : '');
  const [orgId, setOrgId] = useState(productCustomers[0]?.id ?? '');
  const [unlimitedSeats, setUnlimitedSeats] = useState(false);
  const [seats, setSeats] = useState(10);
  const [startDate, setStartDate] = useState(today());
  const [expiryDate, setExpiryDate] = useState(inDays(365));
  const [status, setStatus] = useState<LicenseStatus>('active');
  const [customMessage, setCustomMessage] = useState('');
  const [touched, setTouched] = useState(false);

  if (!app || !id) return <Navigate to="/admin/products" replace />;

  const hasErrors = !title.trim() || !orgId || !startDate || !expiryDate || (!unlimitedSeats && seats < 1);

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
    navigate(licenseTabPath);
  };

  const handleSubmit = () => {
    setTouched(true);
    if (hasErrors) return;
    const license: Omit<License, 'id' | 'licenseNumber' | 'licenseKey'> = {
      orgId,
      appId: id,
      title: title.trim(),
      seats: unlimitedSeats ? undefined : seats,
      startDate,
      expiryDate,
      status,
      customMessage: customMessage.trim() || undefined,
    };
    addLicense(license);
    showToast('License created (prototype only, not persisted)');
    navigate(licenseTabPath);
  };

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Create License" action={<MandatoryIndicator variant="brand" />} />

      {productCustomers.length === 0 ? (
        <section className="admin-panel-card p-4">
          <p className="text-sm text-[var(--text-muted)]">This product has no customers to license yet — assign it to an organization first.</p>
        </section>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); handleSubmit(); }} noValidate className="flex flex-col gap-3">
          <section className="admin-panel-card overflow-hidden">
            <div className="flex flex-col divide-y divide-[var(--line-soft)]">
              <div>
                <div className="admin-panel-card__header"><h2 className="panel-title">License Details</h2></div>
                <div className="grid gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-4">
                  <InputField
                    label="Title" required
                    value={title}
                    onChange={(event) => { setTitle(event.target.value); setTouched(true); }}
                    error={touched && !title.trim() ? 'Enter a license title.' : undefined}
                    wrapperClassName="lg:col-span-2"
                  />
                  <Dropdown
                    label="Customer" required
                    value={orgId}
                    onValueChange={(value) => { setOrgId(value ?? ''); setTouched(true); }}
                    options={productCustomers.map((org) => ({ id: org.id, value: `${org.name} (${org.code})` }))}
                    searchable={false}
                    clearable={false}
                    error={touched && !orgId ? 'Select a customer.' : undefined}
                  />
                  <Dropdown
                    label="Status" required
                    value={status}
                    onValueChange={(value) => setStatus((value as LicenseStatus) ?? 'active')}
                    options={STATUS_OPTIONS}
                    searchable={false}
                    clearable={false}
                  />
                  <div className="flex flex-col gap-1.5">
                    <InputField
                      label="Seats" required type="number" min={1}
                      value={seats}
                      disabled={unlimitedSeats}
                      onChange={(event) => { setSeats(Math.max(1, Number(event.target.value) || 1)); setTouched(true); }}
                      error={touched && !unlimitedSeats && seats < 1 ? 'Enter at least 1 seat.' : undefined}
                    />
                    <CommonCheckbox
                      label="Unlimited seats (site license)"
                      checked={unlimitedSeats}
                      onCheckedChange={(checked) => { setUnlimitedSeats(checked); setTouched(true); }}
                    />
                  </div>
                  <DatePicker
                    label="Start Date" required
                    value={startDate}
                    outputFormat="yyyy-MM-dd" displayFormat="MM/dd/yyyy"
                    onChange={(value) => { setStartDate(value); setTouched(true); }}
                  />
                  <DatePicker
                    label="Expiry Date" required
                    value={expiryDate}
                    outputFormat="yyyy-MM-dd" displayFormat="MM/dd/yyyy"
                    onChange={(value) => { setExpiryDate(value); setTouched(true); }}
                  />
                </div>
              </div>

              <div>
                <div className="admin-panel-card__header"><h2 className="panel-title">Custom Message</h2></div>
                <div className="p-3">
                  <RichTextEditor label="Custom Message" hideLabel value={customMessage} onChange={setCustomMessage} />
                </div>
              </div>
            </div>
          </section>

          <div className="admin-sticky-footer">
            <CommonButton variant="outline" iconLeft={<X size={14} />} onClick={() => void handleCancel()}>Cancel</CommonButton>
            <CommonButton variant="primary" iconLeft={<Save size={14} />} onClick={handleSubmit} disabled={hasErrors}>Save</CommonButton>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateInvoicePage;
