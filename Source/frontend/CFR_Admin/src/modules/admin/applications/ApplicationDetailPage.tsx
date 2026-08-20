import { useMemo, useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { useAdminData } from '../AdminDataContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { AdminApplication, ApplicationStatus, ApplicationVisibility } from '../types';
import { ApplicationPreviewCard } from './ApplicationPreviewCard';

const STATUS_OPTIONS: ApplicationStatus[] = ['active', 'on-request', 'coming-soon', 'future'];
const GRADIENT_PRESETS = [
  'linear-gradient(135deg,#1E3A8A,#3B82F6)',
  'linear-gradient(135deg,#166534,#22C55E)',
  'linear-gradient(135deg,#0F766E,#34D399)',
  'linear-gradient(135deg,#B91C1C,#EF4444)',
  'linear-gradient(135deg,#5B21B6,#8B5CF6)',
  'linear-gradient(135deg,#D97706,#FBBF24)',
];

function blankApp(): AdminApplication {
  return {
    id: '', name: '', shortName: '', category: '', icon: '📦', gradient: GRADIENT_PRESETS[0],
    description: '', features: [], domain: '', status: 'future', visibility: 'hidden', updatedAt: new Date().toISOString().slice(0, 10),
  };
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function ApplicationDetailPage({ mode }: { mode: 'create' | 'edit' }) {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { getApplication, upsertApplication, deleteApplication, applications } = useAdminData();
  const { showToast } = useToast();

  const existing = mode === 'edit' && appId ? getApplication(appId) : undefined;

  const [form, setForm] = useState<AdminApplication>(existing ?? blankApp());
  const [featureDraft, setFeatureDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const idConflict = useMemo(() => {
    if (mode === 'edit') return false;
    const candidate = slugify(form.name);
    return Boolean(candidate) && applications.some((app) => app.id === candidate);
  }, [applications, form.name, mode]);

  if (mode === 'edit' && !existing) return <Navigate to="/admin/applications" replace />;

  const update = <K extends keyof AdminApplication>(key: K, value: AdminApplication[K]) => setForm((current) => ({ ...current, [key]: value }));

  const addFeature = () => {
    const value = featureDraft.trim();
    if (!value) return;
    update('features', [...form.features, value]);
    setFeatureDraft('');
  };
  const removeFeature = (feature: string) => update('features', form.features.filter((item) => item !== feature));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.category.trim()) { showToast('Name and category are required'); return; }
    if (idConflict) { showToast('An application with this name already exists'); return; }

    const nextApp: AdminApplication = {
      ...form,
      id: mode === 'create' ? slugify(form.name) : form.id,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    upsertApplication(nextApp);
    showToast(mode === 'create' ? `${nextApp.name} added to the registry ✓` : `${nextApp.name} updated ✓`);
    navigate(`/admin/applications/${nextApp.id}`);
  };

  const handleDelete = () => {
    if (!existing) return;
    deleteApplication(existing.id);
    showToast(`${existing.name} removed from the registry`);
    setConfirmDelete(false);
    navigate('/admin/applications');
  };

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={mode === 'create' ? 'New application' : form.name}
        description={mode === 'create' ? 'Add a new application to the Catholic Solutions registry.' : `Editing ${form.category || 'application'} details.`}
        action={mode === 'edit' ? (
          <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-[var(--radius-control)] border border-[var(--error)] px-3 py-2 text-xs font-bold text-[var(--error)] hover:bg-[var(--error-bg)]">
            Remove application
          </button>
        ) : undefined}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-secondary)]">
              Name
              <input required value={form.name} onChange={(event) => update('name', event.target.value)} className="rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal text-[var(--text-primary)]" />
              {idConflict ? <span className="font-semibold text-[var(--error)]">An application with this id already exists.</span> : null}
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-secondary)]">
              Short name
              <input value={form.shortName} onChange={(event) => update('shortName', event.target.value)} className="rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal text-[var(--text-primary)]" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-secondary)]">
              Category
              <input required value={form.category} onChange={(event) => update('category', event.target.value)} className="rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal text-[var(--text-primary)]" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-secondary)]">
              Domain
              <input value={form.domain} onChange={(event) => update('domain', event.target.value)} placeholder="app.optioncapp.com" className="rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal text-[var(--text-primary)]" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-secondary)]">
              Icon (emoji)
              <input value={form.icon} onChange={(event) => update('icon', event.target.value)} maxLength={4} className="rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal text-[var(--text-primary)]" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-secondary)]">
              Status
              <select value={form.status} onChange={(event) => update('status', event.target.value as ApplicationStatus)} className="rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal capitalize text-[var(--text-primary)]">
                {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status.replace('-', ' ')}</option>)}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs font-bold text-[var(--text-secondary)]">
            Description
            <textarea value={form.description} onChange={(event) => update('description', event.target.value)} rows={3} className="rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal leading-6 text-[var(--text-primary)]" />
          </label>

          <div className="flex flex-col gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
            Features
            <div className="flex flex-wrap gap-1.5">
              {form.features.map((feature) => (
                <span key={feature} className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                  {feature}
                  <button type="button" onClick={() => removeFeature(feature)} aria-label={`Remove ${feature}`} className="text-[var(--text-faint)] hover:text-[var(--error)]">✕</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={featureDraft}
                onChange={(event) => setFeatureDraft(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addFeature(); } }}
                placeholder="Add a feature and press Enter"
                className="flex-1 rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-normal text-[var(--text-primary)]"
              />
              <button type="button" onClick={addFeature} className="action-secondary">Add</button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
            Accent gradient
            <div className="flex flex-wrap gap-2">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => update('gradient', preset)}
                  aria-label={`Use gradient ${preset}`}
                  aria-pressed={form.gradient === preset}
                  className={`size-8 rounded-lg ${form.gradient === preset ? 'ring-2 ring-offset-2 ring-[var(--secondary)]' : ''}`}
                  style={{ background: preset }}
                />
              ))}
            </div>
          </div>

          <fieldset className="flex flex-col gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
            <legend className="mb-0.5">Visibility</legend>
            <div className="flex gap-4">
              {(['public', 'hidden'] as ApplicationVisibility[]).map((option) => (
                <label key={option} className="flex items-center gap-1.5 font-semibold capitalize">
                  <input type="radio" name="visibility" checked={form.visibility === option} onChange={() => update('visibility', option)} />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 border-t border-[var(--line-soft)] pt-3">
            <button type="button" onClick={() => navigate('/admin/applications')} className="action-secondary">Cancel</button>
            <button type="submit" className="action-primary">{mode === 'create' ? 'Create application' : 'Save changes'}</button>
          </div>
        </form>

        <div className="flex flex-col gap-2">
          <h2 className="panel-title">App Hub preview</h2>
          <ApplicationPreviewCard app={form} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Remove application?"
        description={`This removes "${existing?.name}" from the registry. This cannot be undone in this session.`}
        confirmLabel="Remove"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
