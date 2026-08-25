import { useState } from 'react';
import { CommonButton } from '@app/components/buttons';
import { InputField, TextareaField, RadioGroup, ProfileImageUpload } from '@app/components/formControls';
import { ProductCard } from './ProductCard';
import type { AdminApplication, ProductLicenseType, ProductNavigationTarget } from '../types';
import type { ProductFormErrors } from './productValidation';

const LICENSE_TYPE_OPTIONS: Array<{ id: ProductLicenseType; value: string }> = [
  { id: 'free', value: 'Free' },
  { id: 'licensed', value: 'Licensed' },
];

const NAVIGATION_OPTIONS: Array<{ id: ProductNavigationTarget; value: string }> = [
  { id: 'same-tab', value: 'Same Tab' },
  { id: 'new-tab', value: 'New Tab' },
];

function TagList({ label, values, draft, onDraftChange, onAdd, onRemove }: {
  label: string;
  values: string[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {values.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">None added yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <li key={value} className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
              {value}
              <button type="button" onClick={() => onRemove(value)} aria-label={`Remove ${value}`} className="text-[var(--text-faint)] hover:text-[var(--error)]">✕</button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); onAdd(); } }}
          placeholder={`Add ${label.toLowerCase()} and press Enter`}
          className="flex-1 rounded-[var(--admin-control-radius)] border border-[var(--line)] px-3 py-2 text-[length:var(--admin-text-base)] text-[var(--text-primary)]"
        />
        <CommonButton variant="outline" size="sm" onClick={onAdd}>Add</CommonButton>
      </div>
    </div>
  );
}

interface ProductFormProps {
  form: AdminApplication;
  errors: ProductFormErrors;
  touched: boolean;
  onUpdate: <K extends keyof AdminApplication>(key: K, value: AdminApplication[K]) => void;
}

/** One consolidated panel, mirroring ProductDetailsTab's layout — same sections, editable. */
export function ProductForm({ form, errors, touched, onUpdate }: ProductFormProps) {
  const [featureDraft, setFeatureDraft] = useState('');

  const addFeature = () => {
    const value = featureDraft.trim();
    if (!value) return;
    onUpdate('features', [...form.features, value]);
    setFeatureDraft('');
  };
  const removeFeature = (value: string) => onUpdate('features', form.features.filter((item) => item !== value));

  const handleLogoChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') onUpdate('icon', reader.result); };
    reader.readAsDataURL(file);
  };

  return (
    <section className="admin-panel-card">
      <div className="flex flex-col divide-y divide-[var(--line-soft)]">
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <InputField label="Product Name" required value={form.name} onChange={(event) => onUpdate('name', event.target.value)} error={touched ? errors.name : undefined} />
          <InputField label="Short Name" value={form.shortName} onChange={(event) => onUpdate('shortName', event.target.value)} />
          <InputField label="Product Subtitle" required value={form.category} onChange={(event) => onUpdate('category', event.target.value)} error={touched ? errors.category : undefined} />
          <InputField
            label="Production URL"
            value={form.productionUrl}
            onChange={(event) => onUpdate('productionUrl', event.target.value)}
            placeholder="https://app.optioncapp.com"
            error={touched ? errors.productionUrl : undefined}
          />
          <RadioGroup
            label="License Type"
            options={LICENSE_TYPE_OPTIONS}
            value={form.licenseType}
            onValueChange={(value) => onUpdate('licenseType', value as ProductLicenseType)}
          />
          <RadioGroup
            label="Navigation Target"
            options={NAVIGATION_OPTIONS}
            value={form.navigationTarget}
            onValueChange={(value) => onUpdate('navigationTarget', value as ProductNavigationTarget)}
          />
        </div>

        <div className="p-4">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Features</p>
          <TagList label="Features" values={form.features} draft={featureDraft} onDraftChange={setFeatureDraft} onAdd={addFeature} onRemove={removeFeature} />
        </div>

        <div className="p-4">
          <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Product Preview</p>
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <ProfileImageUpload
              label="Product Logo"
              onFileChange={handleLogoChange}
              fallbackInitials={form.icon.length <= 2 ? form.icon : undefined}
              initialPreviewUrl={form.icon.startsWith('data:') || /^https?:\/\//.test(form.icon) ? form.icon : undefined}
            />
            <ProductCard app={form} className="max-w-xs" />
          </div>
        </div>

        <div className="p-4">
          <TextareaField label="Description" value={form.description} onChange={(event) => onUpdate('description', event.target.value)} rows={3} showCharCount={false} placeholder="What does this product do?" />
        </div>
      </div>
    </section>
  );
}
