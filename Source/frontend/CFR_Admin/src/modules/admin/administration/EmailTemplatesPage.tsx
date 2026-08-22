import { useMemo, useRef, useState } from 'react';
import { Eye, Pencil, RotateCcw, Save, Send } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { Button } from '../components/form/Button';
import { TextField, TextareaField } from '../components/form/TextField';
import { confirmAction } from '../lib/confirm';

interface EmailTemplateVariable {
  token: string;
  label: string;
}

interface EmailTemplateDraft {
  id: string;
  label: string;
  description: string;
  subject: string;
  body: string;
  variables: EmailTemplateVariable[];
}

const DEFAULT_TEMPLATES: EmailTemplateDraft[] = [
  {
    id: 'welcome',
    label: 'Welcome email',
    description: 'Sent when a new account is provisioned.',
    subject: 'Welcome to Catholic Solutions',
    body: 'Hi {{first_name}},\n\nYour Catholic Solutions account is ready. Sign in to get started with your organization\'s workspace.',
    variables: [{ token: '{{first_name}}', label: 'First name' }],
  },
  {
    id: 'access-approved',
    label: 'Access approved',
    description: 'Sent when an access request is approved.',
    subject: 'Your application access request was approved',
    body: 'Hi {{first_name}},\n\nYour request for access to {{app_name}} has been approved. You can now launch it from App Hub.',
    variables: [{ token: '{{first_name}}', label: 'First name' }, { token: '{{app_name}}', label: 'Application name' }],
  },
  {
    id: 'access-info',
    label: 'More information needed',
    description: 'Sent when a reviewer requests more detail on a request.',
    subject: 'More information needed for your request',
    body: 'Hi {{first_name}},\n\nWe need a bit more information to process your request for {{app_name}}:\n\n{{note}}',
    variables: [{ token: '{{first_name}}', label: 'First name' }, { token: '{{app_name}}', label: 'Application name' }, { token: '{{note}}', label: 'Reviewer note' }],
  },
];

const SAMPLE_VALUES: Record<string, string> = {
  first_name: 'Jordan',
  app_name: 'Matt Money',
  note: 'Please confirm your role at the organization before we can proceed.',
};

function renderSample(text: string) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => SAMPLE_VALUES[key] ?? match);
}

export function EmailTemplatesPage() {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplateDraft[]>(DEFAULT_TEMPLATES);
  const [selectedId, setSelectedId] = useState(DEFAULT_TEMPLATES[0].id);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const template = templates.find((item) => item.id === selectedId) ?? templates[0];
  const original = useMemo(() => DEFAULT_TEMPLATES.find((item) => item.id === selectedId)!, [selectedId]);
  const isDirty = template.subject !== original.subject || template.body !== original.body;

  const updateField = (field: 'subject' | 'body', value: string) => {
    setTemplates((prev) => prev.map((item) => (item.id === selectedId ? { ...item, [field]: value } : item)));
  };

  const insertVariable = (token: string) => {
    const el = bodyRef.current;
    const start = el?.selectionStart ?? template.body.length;
    const end = el?.selectionEnd ?? template.body.length;
    const next = `${template.body.slice(0, start)}${token}${template.body.slice(end)}`;
    updateField('body', next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const handleSave = () => {
    showToast(`${template.label} saved ✓ (prototype only, not persisted)`);
  };

  const handleReset = async () => {
    const confirmed = await confirmAction({
      title: 'Reset this template?',
      description: `"${template.label}" will be restored to its default subject and body. Unsaved changes will be lost.`,
      confirmLabel: 'Reset template',
      tone: 'danger',
    });
    if (!confirmed) return;
    setTemplates((prev) => prev.map((item) => (item.id === selectedId ? { ...original } : item)));
    showToast(`${template.label} reset to default ✓`);
  };

  const handleSendTest = () => {
    showToast('Test email sent to you@catholicsolutions.org (prototype only, not actually sent)');
  };

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Email templates" description="Edit the transactional emails sent to organizations and users." />

      <div className="grid gap-4 lg:grid-cols-[15rem_1fr]">
        <ul className="flex flex-col gap-1.5">
          {templates.map((item) => {
            const itemOriginal = DEFAULT_TEMPLATES.find((def) => def.id === item.id)!;
            const edited = item.subject !== itemOriginal.subject || item.body !== itemOriginal.body;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => { setSelectedId(item.id); setMode('edit'); }}
                  className={`admin-email-template-item ${item.id === selectedId ? 'admin-email-template-item--active' : ''}`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="truncate">{item.label}</span>
                    {edited ? <span className="admin-email-template-item__dot" title="Edited, not saved" aria-label="Edited, not saved" /> : null}
                  </span>
                  <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">{item.description}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <section className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div>
              <h2 className="panel-title">{template.label}</h2>
              <p className="panel-subtitle">{template.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button variant={mode === 'edit' ? 'primary' : 'secondary'} icon={<Pencil size={13} />} onClick={() => setMode('edit')}>Edit</Button>
              <Button variant={mode === 'preview' ? 'primary' : 'secondary'} icon={<Eye size={13} />} onClick={() => setMode('preview')}>Preview</Button>
              <Button variant="secondary" icon={<Send size={13} />} onClick={handleSendTest}>Send test</Button>
            </div>
          </div>

          {mode === 'edit' ? (
            <div className="flex flex-col gap-3 p-4">
              <TextField
                label="Subject"
                value={template.subject}
                onChange={(event) => updateField('subject', event.target.value)}
              />
              <TextareaField
                label="Body"
                ref={bodyRef}
                rows={11}
                value={template.body}
                onChange={(event) => updateField('body', event.target.value)}
                hint="Use the merge tags below to personalize this email — click one to insert it at your cursor."
              />

              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Merge tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {template.variables.map((variable) => (
                    <button
                      key={variable.token}
                      type="button"
                      onClick={() => insertVariable(variable.token)}
                      className="admin-email-template-tag"
                      title={`Insert ${variable.label}`}
                    >
                      {variable.token}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line-soft)] pt-3">
                <span className="text-xs font-semibold text-[var(--text-faint)]">
                  {isDirty ? 'Unsaved changes' : 'No changes since last save'}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" icon={<RotateCcw size={13} />} onClick={handleReset} disabled={!isDirty}>Reset to default</Button>
                  <Button variant="primary" icon={<Save size={13} />} onClick={handleSave} disabled={!isDirty}>Save changes</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="admin-email-preview">
                <div className="admin-email-preview__meta">
                  <span><strong>To:</strong> jordan.reyes@sampleorg.edu</span>
                  <span><strong>From:</strong> no-reply@catholicsolutions.org</span>
                </div>
                <p className="admin-email-preview__subject">{renderSample(template.subject)}</p>
                <pre className="admin-email-preview__body">{renderSample(template.body)}</pre>
              </div>
              <p className="mt-3 text-xs text-[var(--text-faint)]">Preview shown with sample data — this prototype does not send real email.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
