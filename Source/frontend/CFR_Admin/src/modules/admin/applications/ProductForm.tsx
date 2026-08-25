import { useState } from 'react';
import { CommonButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { InputField, TextareaField, RadioGroup } from '@app/components/formControls';
import type { AdminApplication, ProductNavigationTarget, ProductVisibility } from '../types';
import type { ProductFormErrors } from './productValidation';

const GRADIENT_PRESETS = [
  'linear-gradient(135deg,#1E3A8A,#3B82F6)',
  'linear-gradient(135deg,#166534,#22C55E)',
  'linear-gradient(135deg,#0F766E,#34D399)',
  'linear-gradient(135deg,#B91C1C,#EF4444)',
  'linear-gradient(135deg,#5B21B6,#8B5CF6)',
  'linear-gradient(135deg,#D97706,#FBBF24)',
];

const VISIBILITY_OPTIONS: Array<{ id: ProductVisibility; value: string }> = [
  { id: 'public', value: 'Public' },
  { id: 'hidden', value: 'Hidden' },
];

const NAVIGATION_OPTIONS: Array<{ id: ProductNavigationTarget; value: string }> = [
  { id: 'same-tab', value: 'Same Tab' },
  { id: 'new-tab', value: 'New Tab' },
];

function TagList({ label, values, draft, onDraftChange, onAdd, onRemove, tone = 'muted' }: {
  label: string;
  values: string[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (value: string) => void;
  tone?: 'muted' | 'info';
}) {
  const chipClass = tone === 'info'
    ? 'bg-[var(--info-bg)] text-[var(--info)]'
    : 'bg-[var(--surface-muted)] text-[var(--text-secondary)]';
  return (
    <div className="flex flex-col gap-2">
      {values.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">None added yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <li key={value} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${chipClass}`}>
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
        <CommonButton variant="outline" onClick={onAdd}>Add</CommonButton>
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
  const [integrationDraft, setIntegrationDraft] = useState('');

  const addToList = (key: 'features' | 'integrations', draft: string, setDraft: (value: string) => void) => {
    const value = draft.trim();
    if (!value) return;
    onUpdate(key, [...form[key], value]);
    setDraft('');
  };
  const removeFromList = (key: 'features' | 'integrations', value: string) => onUpdate(key, form[key].filter((item) => item !== value));

  return (
    <section className="admin-panel-card">
      <div className="flex flex-col divide-y divide-[var(--line-soft)]">
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <InputField label="Product name" required value={form.name} onChange={(event) => onUpdate('name', event.target.value)} error={touched ? errors.name : undefined} />
          <InputField label="Short name" value={form.shortName} onChange={(event) => onUpdate('shortName', event.target.value)} />
          <InputField label="Category" required value={form.category} onChange={(event) => onUpdate('category', event.target.value)} error={touched ? errors.category : undefined} />
          <InputField
            label="Production URL"
            value={form.productionUrl}
            onChange={(event) => onUpdate('productionUrl', event.target.value)}
            placeholder="https://app.optioncapp.com"
            error={touched ? errors.productionUrl : undefined}
          />
          <RadioGroup
            label="Visibility"
            options={VISIBILITY_OPTIONS}
            value={form.visibility}
            onValueChange={(value) => onUpdate('visibility', value as ProductVisibility)}
          />
          <RadioGroup
            label="Navigation target"
            options={NAVIGATION_OPTIONS}
            value={form.navigationTarget}
            onValueChange={(value) => onUpdate('navigationTarget', value as ProductNavigationTarget)}
          />
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Features</p>
            <TagList label="Features" values={form.features} draft={featureDraft} onDraftChange={setFeatureDraft} onAdd={() => addToList('features', featureDraft, setFeatureDraft)} onRemove={(value) => removeFromList('features', value)} />
          </div>
          <div>
            <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Integrations</p>
            <TagList label="Integrations" values={form.integrations} draft={integrationDraft} onDraftChange={setIntegrationDraft} onAdd={() => addToList('integrations', integrationDraft, setIntegrationDraft)} onRemove={(value) => removeFromList('integrations', value)} tone="info" />
          </div>
        </div>

        <div className="p-4">
          <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Product Preview</p>
          <div className="flex flex-wrap items-center gap-2 pb-3">
            <InputField label="Icon (emoji)" value={form.icon} onChange={(event) => onUpdate('icon', event.target.value)} maxLength={4} wrapperClassName="w-24" />
            <div className="flex flex-col gap-1.5 text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-bold)] text-[var(--text-secondary)]">
              Accent color
              <div className="flex flex-wrap gap-2">
                {GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onUpdate('gradient', preset)}
                    aria-label={`Use accent color ${preset}`}
                    aria-pressed={form.gradient === preset}
                    className={`size-7 rounded-lg ${form.gradient === preset ? 'ring-2 ring-offset-2 ring-[var(--secondary)]' : ''}`}
                    style={{ background: preset }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="admin-product-card max-w-xs" style={{ cursor: 'default' }}>
            <div className="flex items-start justify-between gap-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg text-sm text-white" style={{ background: form.gradient }} aria-hidden="true">{form.icon}</span>
              <StatusBadge status={form.status} kind="application" />
            </div>
            <div className="mt-2 min-w-0">
              <span className="block truncate text-sm font-extrabold text-[var(--text-primary)]">{form.name || 'Untitled product'}</span>
              <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">{form.category || 'Uncategorized'}</span>
            </div>
            <p className="admin-product-card__description">{form.description || 'No description yet.'}</p>
          </div>
        </div>

        <div className="grid gap-x-5 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['Product ID', form.id],
            ['Ownership', form.ownership],
            ['Deployment Model', form.deploymentModel],
            ['Registry Reference', form.registryRef],
            ['Source Location', form.sourceLocation],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
              <p className="mt-0.5 truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">{value}</p>
            </div>
          ))}
        </div>

        <div className="p-4">
          <TextareaField label="Description" value={form.description} onChange={(event) => onUpdate('description', event.target.value)} rows={3} showCharCount={false} placeholder="What does this product do?" />
        </div>
      </div>
    </section>
  );
}
