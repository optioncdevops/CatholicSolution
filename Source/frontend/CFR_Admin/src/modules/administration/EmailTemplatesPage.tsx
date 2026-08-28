import { useMemo, useRef, useState } from 'react';
import { RotateCcw, Save, Search, Send, Settings } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { InputField } from '@app/components/formControls';
// The ported formControls Input/TextareaField don't forward a ref to the underlying element,
// which the merge-tag "insert at cursor" feature below needs — keep the local ref-forwarding ones.
import { InputField as SubjectField, TextareaField } from '@app/components/form/TextField';
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
  const [search, setSearch] = useState('');
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const activeFieldRef = useRef<'subject' | 'body'>('body');

  const template = templates.find((item) => item.id === selectedId) ?? templates[0];
  const original = useMemo(() => DEFAULT_TEMPLATES.find((item) => item.id === selectedId)!, [selectedId]);
  const isDirty = template.subject !== original.subject || template.body !== original.body;

  const filteredTemplates = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return templates;
    return templates.filter((item) => item.label.toLowerCase().includes(needle) || item.description.toLowerCase().includes(needle));
  }, [templates, search]);

  const updateField = (field: 'subject' | 'body', value: string) => {
    setTemplates((prev) => prev.map((item) => (item.id === selectedId ? { ...item, [field]: value } : item)));
  };

  const insertVariable = (token: string) => {
    const field = activeFieldRef.current;
    const el = field === 'subject' ? subjectRef.current : bodyRef.current;
    const text = field === 'subject' ? template.subject : template.body;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = `${text.slice(0, start)}${token}${text.slice(end)}`;
    updateField(field, next);
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

  const handleMailSettings = () => {
    showToast('Mail settings would open here (prototype only)');
  };

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Email Templates" />

      <div className="grid gap-4 lg:grid-cols-[16rem_1fr] lg:items-start">
        <section className="admin-panel-card overflow-hidden">
          <div className="border-b border-[var(--line-soft)] p-2.5">
            <InputField
              label="Search templates" hideLabel
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search templates…"
              startIcon={<Search size={13} />}
              className="min-h-8 text-xs placeholder:text-xs"
            />
          </div>
          <ul className="flex flex-col gap-0.5 p-1.5">
            {filteredTemplates.length === 0 ? (
              <li className="px-2 py-3 text-center text-xs text-[var(--text-muted)]">No templates match "{search}".</li>
            ) : filteredTemplates.map((item) => {
              const itemOriginal = DEFAULT_TEMPLATES.find((def) => def.id === item.id)!;
              const edited = item.subject !== itemOriginal.subject || item.body !== itemOriginal.body;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
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
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__header">
            <div className="min-w-0">
              <h2 className="panel-title truncate">{template.label}</h2>
              <p className="panel-subtitle truncate">{template.description}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <CommonButton variant="outline" size="sm" iconLeft={<RotateCcw size={13} />} onClick={() => void handleReset()} disabled={!isDirty}>Reset</CommonButton>
              <CommonButton variant="outline" size="sm" iconLeft={<Settings size={13} />} onClick={handleMailSettings}>Mail Settings</CommonButton>
              <CommonButton variant="outline" size="sm" iconLeft={<Send size={13} />} onClick={handleSendTest}>Send Test</CommonButton>
              <CommonButton variant="primary" size="sm" iconLeft={<Save size={13} />} onClick={handleSave} disabled={!isDirty}>Save</CommonButton>
            </div>
          </div>

          <div className="grid gap-0 divide-y divide-[var(--line-soft)] xl:grid-cols-2 xl:divide-x xl:divide-y-0">
            <div className="flex flex-col gap-3 p-4">
              <SubjectField
                label="Subject" required
                ref={subjectRef}
                value={template.subject}
                onChange={(event) => updateField('subject', event.target.value)}
                onFocus={() => { activeFieldRef.current = 'subject'; }}
              />
              <TextareaField
                label="Body"
                ref={bodyRef}
                rows={12}
                value={template.body}
                onChange={(event) => updateField('body', event.target.value)}
                onFocus={() => { activeFieldRef.current = 'body'; }}
                hint="Use the merge tags below to personalize the subject or body — click one to insert it at your cursor."
              />
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Merge Tags</p>
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
            </div>

            <div className="flex flex-col gap-2 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Live Preview</p>
              <div className="admin-email-preview">
                <p className="admin-email-preview__subject">{renderSample(template.subject) || 'Untitled subject'}</p>
                {template.body ? (
                  <pre className="admin-email-preview__body">{renderSample(template.body)}</pre>
                ) : (
                  <p className="text-xs italic text-[var(--text-faint)]">Start typing the body to see it rendered here with sample data.</p>
                )}
              </div>
              <p className="text-xs text-[var(--text-faint)]">Shown with sample data — this prototype does not send real email.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
