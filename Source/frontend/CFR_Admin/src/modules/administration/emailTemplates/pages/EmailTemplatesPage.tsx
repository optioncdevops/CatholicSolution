import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Save, Search, Send, Settings } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { InputField } from '@app/components/formControls';
// The ported formControls Input/TextareaField don't forward a ref to the underlying element,
// which the merge-tag "insert at cursor" feature below needs — keep the local ref-forwarding ones.
import { InputField as SubjectField, TextareaField } from '@app/components/form/TextField';
import { getStoredAcutisAuth } from '@shared/auth/services/authService';
import { confirmAction } from '../../../lib/confirm';
import { getEmailTemplates, saveEmailTemplate, sendTestEmail } from '../services/emailTemplatesService';
import type { EmailTemplateApiItem, EmailTemplateFormValues } from '../types/emailTemplatesTypes';
import { EMAIL_TEMPLATE_VARIABLES, normalizeEmailTemplatesList, renderSample, templateDescription, templateDisplayLabel } from '../utils/emailTemplatesHelpers';
import { validateEmailTemplate } from '../validator/EmailTemplatesValidator';

function EmailTemplatesPage() {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [templates, setTemplates] = useState<EmailTemplateApiItem[]>([]);
  const [drafts, setDrafts] = useState<Record<number, EmailTemplateFormValues>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const activeFieldRef = useRef<'subject' | 'body'>('body');
  //#endregion

  //#region Functions
  const applyTemplatesList = useCallback((list: EmailTemplateApiItem[]) => {
    setTemplates(list);
    setDrafts(Object.fromEntries(list.map((item) => [item.templateId, { subject: item.subject, body: item.body }])));
    setSelectedId((current) => current ?? list[0]?.templateId ?? null);
  }, []);

  const load = useCallback(async () => {
    try {
      const { resultData } = await getEmailTemplates();
      applyTemplatesList(normalizeEmailTemplatesList(resultData));
    } catch (error) {
      console.error('Error loading email templates:', error);
      showToast('Failed to load email templates.', 'error');
    }
  }, [applyTemplatesList, showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { resultData } = await getEmailTemplates();
        if (cancelled) return;
        applyTemplatesList(normalizeEmailTemplatesList(resultData));
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading email templates:', error);
        showToast('Failed to load email templates.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only fetch; use load() for manual re-fetches
  }, []);
  //#endregion

  const template = useMemo(() => templates.find((item) => item.templateId === selectedId) ?? null, [templates, selectedId]);
  const draft = (template ? drafts[template.templateId] : undefined) ?? { subject: '', body: '' };
  const isDirty = Boolean(template) && (draft.subject !== template!.subject || draft.body !== template!.body);

  const filteredTemplates = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return templates;
    return templates.filter((item) => templateDisplayLabel(item.templateCode).toLowerCase().includes(needle) || templateDescription(item.templateCode).toLowerCase().includes(needle));
  }, [templates, search]);

  const updateField = (field: 'subject' | 'body', value: string) => {
    if (!template) return;
    setDrafts((prev) => ({ ...prev, [template.templateId]: { ...prev[template.templateId], [field]: value } }));
  };

  const insertVariable = (token: string) => {
    if (!template) return;
    const field = activeFieldRef.current;
    const el = field === 'subject' ? subjectRef.current : bodyRef.current;
    const text = field === 'subject' ? draft.subject : draft.body;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = `${text.slice(0, start)}${token}${text.slice(end)}`;
    updateField(field, next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  //#region Handlers
  const handleSave = async () => {
    if (!template) return;
    const validationError = validateEmailTemplate(draft.subject, draft.body);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    setSaving(true);
    try {
      await saveEmailTemplate({
        templateId: template.templateId,
        templateCode: template.templateCode,
        subject: draft.subject,
        body: draft.body,
        status: template.status,
      });
      showToast(`${templateDisplayLabel(template.templateCode)} saved.`, 'success');
      await load();
    } catch (error) {
      console.error('Error saving email template:', error);
      showToast(typeof error === 'string' ? error : 'Failed to save email template.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!template) return;
    const confirmed = await confirmAction({
      title: 'Reset this template?',
      description: `"${templateDisplayLabel(template.templateCode)}" will be restored to its last saved subject and body. Unsaved changes will be lost.`,
      confirmLabel: 'Reset template',
      tone: 'danger',
    });
    if (!confirmed) return;
    setDrafts((prev) => ({ ...prev, [template.templateId]: { subject: template.subject, body: template.body } }));
    showToast(`${templateDisplayLabel(template.templateCode)} reset to last saved version.`, 'success');
  };

  const handleSendTest = async () => {
    if (!template) return;
    const toAddress = getStoredAcutisAuth()?.resultData?.user?.eMail;
    if (!toAddress) {
      showToast('Sign in again to send a test email to your account address.', 'error');
      return;
    }

    setSendingTest(true);
    try {
      await sendTestEmail({
        templateCode: template.templateCode,
        subject: draft.subject,
        body: draft.body,
        toAddress,
      });
      showToast(`Test email sent to ${toAddress}.`, 'success');
    } catch (error) {
      console.error('Error sending test email:', error);
      showToast(typeof error === 'string' ? error : 'Failed to send test email.', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  const handleMailSettings = () => {
    showToast('Mail settings would open here (not yet built).');
  };
  //#endregion

  //#region Render
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
            {loading ? (
              <li className="px-2 py-3 text-center text-xs text-[var(--text-muted)]">Loading templates…</li>
            ) : filteredTemplates.length === 0 ? (
              <li className="px-2 py-3 text-center text-xs text-[var(--text-muted)]">No templates match "{search}".</li>
            ) : filteredTemplates.map((item) => {
              const itemDraft = drafts[item.templateId];
              const edited = Boolean(itemDraft) && (itemDraft.subject !== item.subject || itemDraft.body !== item.body);
              return (
                <li key={item.templateId}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.templateId)}
                    className={`admin-email-template-item ${item.templateId === selectedId ? 'admin-email-template-item--active' : ''}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="truncate">{templateDisplayLabel(item.templateCode)}</span>
                      {edited ? <span className="admin-email-template-item__dot" title="Edited, not saved" aria-label="Edited, not saved" /> : null}
                    </span>
                    <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">{templateDescription(item.templateCode)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {template ? (
          <section className="admin-panel-card">
            <div className="admin-panel-card__header">
              <div className="min-w-0">
                <h2 className="panel-title truncate">{templateDisplayLabel(template.templateCode)}</h2>
                <p className="panel-subtitle truncate">{templateDescription(template.templateCode)}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <CommonButton variant="outline" size="sm" iconLeft={<RotateCcw size={13} />} onClick={() => void handleReset()} disabled={!isDirty || saving}>Reset</CommonButton>
                <CommonButton variant="outline" size="sm" iconLeft={<Settings size={13} />} onClick={handleMailSettings}>Mail Settings</CommonButton>
                <CommonButton variant="outline" size="sm" iconLeft={<Send size={13} />} onClick={() => void handleSendTest()} disabled={sendingTest}>{sendingTest ? 'Sending…' : 'Send Test'}</CommonButton>
                <CommonButton variant="primary" size="sm" iconLeft={<Save size={13} />} onClick={() => void handleSave()} disabled={!isDirty || saving}>{saving ? 'Saving…' : 'Save'}</CommonButton>
              </div>
            </div>

            <div className="grid gap-0 divide-y divide-[var(--line-soft)] xl:grid-cols-2 xl:divide-x xl:divide-y-0">
              <div className="flex flex-col gap-3 p-4">
                <SubjectField
                  label="Subject" required
                  ref={subjectRef}
                  value={draft.subject}
                  onChange={(event) => updateField('subject', event.target.value)}
                  onFocus={() => { activeFieldRef.current = 'subject'; }}
                />
                <TextareaField
                  label="Body"
                  ref={bodyRef}
                  rows={12}
                  value={draft.body}
                  onChange={(event) => updateField('body', event.target.value)}
                  onFocus={() => { activeFieldRef.current = 'body'; }}
                  hint="Use the merge tags below to personalize the subject or body — click one to insert it at your cursor."
                />
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Merge Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(EMAIL_TEMPLATE_VARIABLES[template.templateCode] ?? []).map((variable) => (
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
                  <p className="admin-email-preview__subject">{renderSample(template.templateCode, draft.subject) || 'Untitled subject'}</p>
                  {draft.body ? (
                    <pre className="admin-email-preview__body">{renderSample(template.templateCode, draft.body)}</pre>
                  ) : (
                    <p className="text-xs italic text-[var(--text-faint)]">Start typing the body to see it rendered here with sample data.</p>
                  )}
                </div>
                <p className="text-xs text-[var(--text-faint)]">Shown with sample data — "Send Test" sends this content for real to your own inbox.</p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
  //#endregion
}

export default EmailTemplatesPage;
