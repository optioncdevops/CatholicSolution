import { useState } from 'react';
import { Drawer } from '../components/Drawer';
import { Button } from '../components/form/Button';
import { TextField, TextareaField } from '../components/form/TextField';
import { confirmAction } from '../lib/confirm';
import type { AdminApplication, ProductNavigationTarget, ProductVisibility } from '../types';

const GRADIENT_PRESETS = [
  'linear-gradient(135deg,#1E3A8A,#3B82F6)',
  'linear-gradient(135deg,#166534,#22C55E)',
  'linear-gradient(135deg,#0F766E,#34D399)',
  'linear-gradient(135deg,#B91C1C,#EF4444)',
  'linear-gradient(135deg,#5B21B6,#8B5CF6)',
  'linear-gradient(135deg,#D97706,#FBBF24)',
];

interface FieldErrors {
  name?: string;
  category?: string;
  productionUrl?: string;
}

function validate(form: AdminApplication): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Product name is required.';
  if (!form.category.trim()) errors.category = 'Category is required.';
  if (form.productionUrl.trim()) {
    const validUrl = (() => {
      try {
        const url = new URL(form.productionUrl.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    })();
    if (!validUrl) errors.productionUrl = 'Enter a valid URL, e.g. https://app.optioncapp.com.';
  }
  return errors;
}

function TagList({ label, values, draft, onDraftChange, onAdd, onRemove }: {
  label: string;
  values: string[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-bold)] text-[var(--text-secondary)]">
      {label}
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <span key={value} className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
            {value}
            <button type="button" onClick={() => onRemove(value)} aria-label={`Remove ${value}`} className="text-[var(--text-faint)] hover:text-[var(--error)]">✕</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); onAdd(); } }}
          placeholder={`Add ${label.toLowerCase()} and press Enter`}
          className="flex-1 rounded-[var(--admin-control-radius)] border border-[var(--line)] px-3 py-2 text-[length:var(--admin-text-base)] text-[var(--text-primary)]"
        />
        <Button variant="secondary" onClick={onAdd}>Add</Button>
      </div>
    </div>
  );
}

interface ProductEditDrawerProps {
  app: AdminApplication | null;
  onClose: () => void;
  onSave: (app: AdminApplication) => void;
}

export function ProductEditDrawer({ app, onClose, onSave }: ProductEditDrawerProps) {
  const [form, setForm] = useState<AdminApplication | null>(app);
  const [featureDraft, setFeatureDraft] = useState('');
  const [integrationDraft, setIntegrationDraft] = useState('');
  const [touched, setTouched] = useState(false);

  if (app && app.id !== form?.id) {
    // Reset local form state whenever a different product is opened for editing.
    // (Adjusted during render — React's documented pattern — rather than in an effect.)
    setForm(app);
    setTouched(false);
  }

  if (!app || !form) return null;

  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;
  const dirty = touched && JSON.stringify(form) !== JSON.stringify(app);

  const update = <K extends keyof AdminApplication>(key: K, value: AdminApplication[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setTouched(true);
  };

  const addToList = (key: 'features' | 'integrations', draft: string, setDraft: (value: string) => void) => {
    const value = draft.trim();
    if (!value) return;
    update(key, [...form[key], value]);
    setDraft('');
  };
  const removeFromList = (key: 'features' | 'integrations', value: string) => update(key, form[key].filter((item) => item !== value));

  const requestClose = async () => {
    if (dirty) {
      const confirmed = await confirmAction({
        title: 'Discard unsaved changes?',
        description: 'You have unsaved changes to this product. Closing now will discard them.',
        confirmLabel: 'Discard changes',
        tone: 'danger',
      });
      if (!confirmed) return;
    }
    onClose();
  };

  const handleSave = () => {
    setTouched(true);
    if (hasErrors) return;
    onSave(form);
  };

  return (
    <Drawer
      open={Boolean(app)}
      title="Edit product"
      description={app.name}
      onClose={() => void requestClose()}
      footer={(
        <>
          <Button variant="secondary" onClick={() => void requestClose()}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={hasErrors}>Save changes</Button>
        </>
      )}
    >
      <form onSubmit={(event) => { event.preventDefault(); handleSave(); }} className="flex flex-col gap-4" noValidate>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[length:var(--admin-text-2xs)] [font-weight:var(--admin-weight-extrabold)] uppercase tracking-wide text-[var(--text-faint)]">Editable details</legend>

          <TextField label="Product name" value={form.name} onChange={(event) => update('name', event.target.value)} error={touched ? errors.name : undefined} />
          <TextField label="Short name" value={form.shortName} onChange={(event) => update('shortName', event.target.value)} />
          <TextField label="Category" value={form.category} onChange={(event) => update('category', event.target.value)} error={touched ? errors.category : undefined} />
          <TextareaField label="Description" value={form.description} onChange={(event) => update('description', event.target.value)} rows={3} />
          <TextField label="Icon (emoji)" value={form.icon} onChange={(event) => update('icon', event.target.value)} maxLength={4} className="w-20" />

          <div className="flex flex-col gap-1.5 text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-bold)] text-[var(--text-secondary)]">
            Accent color
            <div className="flex flex-wrap gap-2">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => update('gradient', preset)}
                  aria-label={`Use accent color ${preset}`}
                  aria-pressed={form.gradient === preset}
                  className={`size-7 rounded-lg ${form.gradient === preset ? 'ring-2 ring-offset-2 ring-[var(--secondary)]' : ''}`}
                  style={{ background: preset }}
                />
              ))}
            </div>
          </div>

          <TextField
            label="Production URL"
            value={form.productionUrl}
            onChange={(event) => update('productionUrl', event.target.value)}
            placeholder="https://app.optioncapp.com"
            error={touched ? errors.productionUrl : undefined}
          />

          <fieldset className="flex flex-col gap-1.5 text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-bold)] text-[var(--text-secondary)]">
            <legend className="mb-0.5">Visibility</legend>
            <div className="flex gap-4">
              {(['public', 'hidden'] as ProductVisibility[]).map((option) => (
                <label key={option} className="flex items-center gap-1.5 font-semibold capitalize">
                  <input type="radio" name="edit-visibility" checked={form.visibility === option} onChange={() => update('visibility', option)} />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-1.5 text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-bold)] text-[var(--text-secondary)]">
            <legend className="mb-0.5">Navigation target</legend>
            <div className="flex gap-4">
              {([['same-tab', 'Same tab'], ['new-tab', 'New tab']] as [ProductNavigationTarget, string][]).map(([option, label]) => (
                <label key={option} className="flex items-center gap-1.5 font-semibold">
                  <input type="radio" name="edit-navigation" checked={form.navigationTarget === option} onChange={() => update('navigationTarget', option)} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <TagList label="Features" values={form.features} draft={featureDraft} onDraftChange={setFeatureDraft} onAdd={() => addToList('features', featureDraft, setFeatureDraft)} onRemove={(value) => removeFromList('features', value)} />
          <TagList label="Integrations" values={form.integrations} draft={integrationDraft} onDraftChange={setIntegrationDraft} onAdd={() => addToList('integrations', integrationDraft, setIntegrationDraft)} onRemove={(value) => removeFromList('integrations', value)} />
        </fieldset>

        <fieldset className="flex flex-col gap-2 rounded-[var(--admin-control-radius)] border border-dashed border-[var(--line)] bg-[var(--surface-muted)] p-3">
          <legend className="mb-0.5 px-1 text-[length:var(--admin-text-2xs)] [font-weight:var(--admin-weight-extrabold)] uppercase tracking-wide text-[var(--text-faint)]">Read-only — not editable</legend>
          {[
            ['Product ID', form.id],
            ['Ownership', form.ownership],
            ['Deployment model', form.deploymentModel],
            ['Registry reference', form.registryRef],
            ['Source location', form.sourceLocation],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-[var(--text-muted)]">{label}</span>
              <span className="font-mono text-[var(--text-secondary)]">{value}</span>
            </div>
          ))}
        </fieldset>
      </form>
    </Drawer>
  );
}
