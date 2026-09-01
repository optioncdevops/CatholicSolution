import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, KeyRound, Mail, MailCheck, MailQuestion, RotateCcw, Save, Search, Send, Settings, Sparkles, Wand2,
} from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { Badge } from '@app/components/Badge';
import { InputField } from '@app/components/formControls';
// The ported formControls Input/TextareaField don't forward a ref to the underlying element,
// which the merge-tag "insert at cursor" feature below needs — keep the local ref-forwarding ones.
import { InputField as SubjectField, TextareaField } from '@app/components/form/TextField';
import { getStoredAcutisAuth } from '@shared/auth/services/authService';
import { confirmAction } from '../../../lib/confirm';
import { getEmailTemplates, saveEmailTemplate, sendTestEmail } from '../services/emailTemplatesService';
import type { EmailTemplateApiItem, EmailTemplateFormValues } from '../types/emailTemplatesTypes';
import {
  EMAIL_TEMPLATE_VARIABLES, getUnsupportedPlaceholders, normalizeEmailTemplatesList, renderSample, templateDescription, templateDisplayLabel,
} from '../utils/emailTemplatesHelpers';
import { validateEmailTemplate } from '../validator/EmailTemplatesValidator';

const TEMPLATE_ICON: Record<string, typeof Mail> = {
  PasswordReset: KeyRound,
  Welcome: Sparkles,
  AccessApproved: MailCheck,
  AccessInfo: MailQuestion,
};

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
  const storedAuthEmail = getStoredAcutisAuth()?.resultData?.user?.eMail;

  const unsupportedPlaceholders = useMemo(
    () => (template ? getUnsupportedPlaceholders(template.templateCode, draft.subject, draft.body) : []),
    [template, draft.subject, draft.body],
  );

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
    const validationErrors = validateEmailTemplate(draft.subject, draft.body);
    if (validationErrors.length > 0) {
      showToast(validationErrors, 'error');
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
    const toAddress = storedAuthEmail;
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
    showToast('Mail Settings is a prototype placeholder — there is no SMTP configuration screen yet.');
  };
  //#endregion

  //#region Render
  const TemplateIcon = template ? TEMPLATE_ICON[template.templateCode] ?? Mail : Mail;

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Email Templates" />

      <div className="admin-email-shell">
        <section className="admin-panel-card overflow-hidden">
          <div className="admin-email-search-wrap">
            <InputField
              label="Search templates" hideLabel
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search templates…"
              startIcon={<Search size={13} />}
              className="min-h-8 text-xs placeholder:text-xs"
            />
          </div>
          <div className="admin-email-list">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <div key={index} className="admin-skeleton h-12 w-full rounded-[var(--radius-control)]" />)
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 px-3 py-8 text-center">
                <Search size={18} className="text-[var(--text-faint)]" aria-hidden="true" />
                <p className="text-xs font-bold text-[var(--text-secondary)]">No templates match "{search}"</p>
                <p className="text-[0.6875rem] text-[var(--text-faint)]">Try a different name or clear the search.</p>
              </div>
            ) : filteredTemplates.map((item) => {
              const itemDraft = drafts[item.templateId];
              const edited = Boolean(itemDraft) && (itemDraft.subject !== item.subject || itemDraft.body !== item.body);
              const ItemIcon = TEMPLATE_ICON[item.templateCode] ?? Mail;
              const isActive = item.templateId === selectedId;
              return (
                <button
                  key={item.templateId}
                  type="button"
                  onClick={() => setSelectedId(item.templateId)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`admin-email-template-item ${isActive ? 'admin-email-template-item--active' : ''}`}
                >
                  <span className="admin-email-template-item__icon" aria-hidden="true"><ItemIcon size={15} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="admin-email-template-item__title truncate">{templateDisplayLabel(item.templateCode)}</span>
                      {edited ? <span className="admin-email-template-item__dot" title="Edited, not saved" aria-label="Edited, not saved" /> : null}
                    </span>
                    <span className="admin-email-template-item__desc">{templateDescription(item.templateCode)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {template ? (
          <section className="admin-panel-card">
            <div className="admin-panel-card__header flex-wrap">
              <div className="flex min-w-0 items-center gap-3">
                <span className="admin-email-template-item__icon" aria-hidden="true"><TemplateIcon size={16} /></span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="panel-title truncate">{templateDisplayLabel(template.templateCode)}</h2>
                    <Badge tone={template.status === 'active' ? 'success' : 'neutral'}>{template.status}</Badge>
                  </div>
                  <p className="panel-subtitle truncate">{templateDescription(template.templateCode)}</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className={`admin-status-chip ${isDirty ? 'admin-status-chip--dirty' : 'admin-status-chip--saved'}`}>
                  <span className="admin-status-chip__dot" aria-hidden="true" />
                  {isDirty ? 'Unsaved changes' : 'All changes saved'}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <CommonButton variant="outline" size="sm" iconLeft={<RotateCcw size={13} />} onClick={() => void handleReset()} disabled={!isDirty || saving}>Reset</CommonButton>
                  <CommonButton
                    variant="outline" size="sm" iconLeft={<Settings size={13} />} onClick={handleMailSettings}
                    tooltip="Prototype only — no SMTP settings screen is wired up yet."
                  >
                    Mail Settings
                  </CommonButton>
                  <CommonButton variant="outline" size="sm" iconLeft={<Send size={13} />} onClick={() => void handleSendTest()} disabled={sendingTest}>{sendingTest ? 'Sending…' : 'Send Test'}</CommonButton>
                  <CommonButton variant="primary" size="sm" iconLeft={<Save size={13} />} onClick={() => void handleSave()} disabled={!isDirty || saving}>{saving ? 'Saving…' : 'Save'}</CommonButton>
                </div>
              </div>
            </div>

            {unsupportedPlaceholders.length > 0 ? (
              <div role="alert" className="mx-4 mt-3 flex items-start gap-2 rounded-[var(--radius-panel)] border border-[var(--warning)] bg-[var(--warning-bg)] p-3">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[var(--warning)]" aria-hidden="true" />
                <p className="text-xs font-semibold text-[var(--warning)]">
                  Unsupported placeholder{unsupportedPlaceholders.length > 1 ? 's' : ''} detected: {unsupportedPlaceholders.map((token) => <code key={token} className="mx-0.5">{token}</code>)}.
                  {' '}These aren't merge tags for this template and will be sent to recipients exactly as typed.
                </p>
              </div>
            ) : null}

            <div className="grid gap-0 divide-y divide-[var(--line-soft)] xl:grid-cols-2 xl:divide-x xl:divide-y-0">
              <div className="flex flex-col gap-3 p-4">
                <SubjectField
                  label="Subject" required
                  ref={subjectRef}
                  value={draft.subject}
                  onChange={(event) => updateField('subject', event.target.value)}
                  onFocus={() => { activeFieldRef.current = 'subject'; }}
                  placeholder="Enter the email subject line"
                  hint="Shown as the message subject line — keep it short and specific."
                />
                <TextareaField
                  label="Body"
                  ref={bodyRef}
                  rows={12}
                  value={draft.body}
                  onChange={(event) => updateField('body', event.target.value)}
                  onFocus={() => { activeFieldRef.current = 'body'; }}
                  placeholder="Enter the email body"
                  hint="Supports inline-styled HTML (buttons, links, layout) as well as plain text. Use the merge tags below to personalize the subject or body — click one to insert it at your cursor."
                />
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">
                    <Wand2 size={12} aria-hidden="true" /> Insert Variable
                  </p>
                  <div className="admin-email-tag-group">
                    {(EMAIL_TEMPLATE_VARIABLES[template.templateCode] ?? []).map((variable) => (
                      <button
                        key={variable.token}
                        type="button"
                        onClick={() => insertVariable(variable.token)}
                        className="admin-email-template-tag"
                        title={`Insert ${variable.label} at the cursor`}
                      >
                        <code>{variable.token}</code>
                        {variable.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Live Preview</p>
                  <Badge tone="info">Sample data</Badge>
                </div>
                <div className="admin-email-preview-shell">
                  <div
                    className="admin-email-preview-card"
                    onClick={(event) => { if ((event.target as HTMLElement).closest('a')) event.preventDefault(); }}
                  >
                    <div className="admin-email-preview-card__meta">
                      <div className="admin-email-preview-card__meta-row">
                        <span className="admin-email-preview-card__meta-label">From</span>
                        <span className="admin-email-preview-card__meta-value">Catholic Solution &lt;no-reply@catholicsolution.org&gt;</span>
                      </div>
                      <div className="admin-email-preview-card__meta-row">
                        <span className="admin-email-preview-card__meta-label">To</span>
                        <span className="admin-email-preview-card__meta-value">{storedAuthEmail ?? 'you@example.org'}</span>
                      </div>
                    </div>
                    <p className="admin-email-preview-card__subject">{renderSample(template.templateCode, draft.subject) || 'Untitled subject'}</p>
                    {draft.body ? (
                      // The body is the actual HTML this template sends (SMTPMailService sends IsBodyHtml=true) —
                      // rendering it here, not as escaped text, is what makes the preview match the real email.
                      // Content is the signed-in admin's own draft, rendered back to themselves; no other user's input reaches this.
                      <div className="admin-email-preview-card__body" dangerouslySetInnerHTML={{ __html: renderSample(template.templateCode, draft.body) }} />
                    ) : (
                      <p className="px-4 pb-4 text-xs italic text-[var(--text-faint)]">Start typing the body to see it rendered here with sample data.</p>
                    )}
                  </div>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
                  <CheckCircle2 size={12} className="shrink-0" aria-hidden="true" />
                  Shown with sample data — "Send Test" sends this content for real to your own inbox.
                </p>
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
