import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { MandatoryIndicator } from '@app/components/formControls';
import { useAdminData } from '../AdminDataContext';
import { confirmAction } from '../lib/confirm';
import { validateProductForm } from './productValidation';
import { ProductForm } from './ProductForm';
import type { AdminApplication } from '../types';

export function ProductEditPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { getApplication, updateApplication } = useAdminData();
  const { showToast } = useToast();

  const app = appId ? getApplication(appId) : undefined;
  const [form, setForm] = useState<AdminApplication | null>(app ?? null);
  const [touched, setTouched] = useState(false);

  if (app && app.id !== form?.id) {
    // Reset local form state if a different product is opened for editing.
    // (Adjusted during render — this codebase's convention — rather than in an effect.)
    setForm(app);
    setTouched(false);
  }

  if (!app || !form) return <Navigate to="/admin/applications" replace />;

  const errors = validateProductForm(form);
  const hasErrors = Object.keys(errors).length > 0;
  const dirty = touched && JSON.stringify(form) !== JSON.stringify(app);
  const detailPath = `/admin/applications/${app.id}`;

  const update = <K extends keyof AdminApplication>(key: K, value: AdminApplication[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setTouched(true);
  };

  const handleCancel = async () => {
    if (dirty) {
      const confirmed = await confirmAction({
        title: 'Discard unsaved changes?',
        description: 'You have unsaved changes to this product. Leaving now will discard them.',
        confirmLabel: 'Discard changes',
        tone: 'danger',
      });
      if (!confirmed) return;
    }
    navigate(detailPath);
  };

  const handleSave = () => {
    setTouched(true);
    if (hasErrors) return;
    updateApplication(form);
    showToast(`${form.name} updated ✓`);
    navigate(detailPath);
  };

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader breadcrumb={{ label: app.name, to: detailPath }} title="Edit Product" action={<MandatoryIndicator variant="brand" />} />

      <form onSubmit={(event) => { event.preventDefault(); handleSave(); }} noValidate className="flex flex-col gap-4">
        <ProductForm form={form} errors={errors} touched={touched} onUpdate={update} />

        <div className="admin-sticky-footer">
          <CommonButton variant="outline" iconLeft={<X size={14} />} onClick={() => void handleCancel()}>Cancel</CommonButton>
          <CommonButton variant="primary" iconLeft={<Save size={14} />} onClick={handleSave} disabled={hasErrors}>Save</CommonButton>
        </div>
      </form>
    </div>
  );
}
