import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, Eye, KeyRound, Mail, MailCheck, MailQuestion, RotateCcw, Save, Search, Send, Settings, Sparkles, Wand2,
} from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { Badge, formatStatusLabel } from '@app/components/Badge';
import { BaseModal } from '@app/components/modal/BaseModal';
import { CharacterCount, InputField, RichTextEditor } from '@app/components/formControls';
import { Tooltip } from '@app/components/tooltips/Tooltip';
// The ported formControls InputField doesn't forward a ref to the underlying element, which the
// merge-tag "insert at cursor" feature below needs for the Subject field — keep the local
// ref-forwarding one. The Body field is now the shared RichTextEditor (WYSIWYG, standard
// bold/italic/lists/links/color/image/table toolbar) instead of a raw-HTML textarea.
import { InputField as SubjectField } from '@app/components/form/TextField';
import { getStoredAcutisAuth } from '@shared/auth/services/authService';
import { useFeatureAccessLevel } from '@shared/auth/hooks/useFeatureAccessLevel';
import { confirmAction } from '../../../lib/confirm';
import { getEmailSettings } from '../../emailSettings/services/emailSettingsService';
import type { EmailSettingsApiItem } from '../../emailSettings/types/emailSettingsTypes';
import { getEmailTemplates, saveEmailTemplate, sendTestEmail } from '../services/emailTemplatesService';
import type { EmailTemplateApiItem, EmailTemplateFormValues } from '../types/emailTemplatesTypes';
import {
  EMAIL_TEMPLATE_VARIABLES, getUnsupportedPlaceholders, normalizeEmailTemplatesList, templateDescription, templateDisplayLabel,
} from '../utils/emailTemplatesHelpers';
import { MAX_LINK_EXPIRY_MINUTES, MIN_LINK_EXPIRY_MINUTES, SUBJECT_MAX_LENGTH, validateEmailTemplate } from '../validator/EmailTemplatesValidator';

// Only PasswordReset has a real, time-limited link today — the field is hidden for every other
// template rather than shown-but-meaningless.
const LINK_EXPIRY_TEMPLATE_CODE = 'PasswordReset';

const TEMPLATE_ICON: Record<string, typeof Mail> = {
  PasswordReset: KeyRound,
  Welcome: Sparkles,
  AccessApproved: MailCheck,
  AccessInfo: MailQuestion,
};

const BODY_EDITOR_ID = 'email-template-body-editor';

const draftFromTemplate = (item: EmailTemplateApiItem): EmailTemplateFormValues => ({
  subject: item.subject,
  body: item.body,
  linkExpiryMinutes: item.linkExpiryMinutes != null ? String(item.linkExpiryMinutes) : '',
});

function EmailTemplatesPage() {
  //#region Hooks
  const { showToast } = useToast();
  const navigate = useNavigate();
  // Real enforcement, not just a label: a Read Only grant for this page (set on the User Rights
  // page) disables every action that would change the template itself — Save, Reset, and the
  // Subject/Body fields. Preview and Send Test both stay available since neither one writes
  // anything to the template; sending a test just emails the currently-loaded content as-is.
  const accessLevel = useFeatureAccessLevel('/admin/administration-email-templates');
  const isReadOnly = accessLevel === 'readOnly';
  //#endregion

  //#region States
  const [templates, setTemplates] = useState<EmailTemplateApiItem[]>([]);
  const [drafts, setDrafts] = useState<Record<number, EmailTemplateFormValues>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [logoImageFailed, setLogoImageFailed] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  //#endregion

  //#region Functions
  const applyTemplatesList = useCallback((list: EmailTemplateApiItem[]) => {
    setTemplates(list);
    setDrafts(Object.fromEntries(list.map((item) => [item.templateId, draftFromTemplate(item)])));
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

  // The preview mirrors SMTPMailService.FormatMailContent's real header, so it needs the same
  // platform-wide logo image the Email Settings page manages — not a hardcoded brand mark.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { resultData } = await getEmailSettings();
        if (cancelled) return;
        const item = (resultData ?? null) as EmailSettingsApiItem | null;
        setLogoImageUrl(item?.logoImageUrl ?? null);
        setLogoImageFailed(false);
      } catch (error) {
        if (!cancelled) console.error('Error loading email logo for preview:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  //#endregion

  const template = useMemo(() => templates.find((item) => item.templateId === selectedId) ?? null, [templates, selectedId]);
  const draft = (template ? drafts[template.templateId] : undefined) ?? { subject: '', body: '', linkExpiryMinutes: '' };
  const isDirty = Boolean(template) && (
    draft.subject !== template!.subject
    || draft.body !== template!.body
    || draft.linkExpiryMinutes !== (template!.linkExpiryMinutes != null ? String(template!.linkExpiryMinutes) : '')
  );
  const storedAuthEmail = getStoredAcutisAuth()?.resultData?.user?.eMail;

  // Whether ANY template (not just the one currently open) has an unsaved edit — dirty tracking
  // itself only ever compares the selected template against its own draft, so switching templates
  // never loses anything, but nothing warns before leaving the page entirely while some other
  // template's edit is still sitting unsaved in `drafts`.
  const hasAnyUnsavedChanges = useMemo(() => templates.some((item) => {
    const itemDraft = drafts[item.templateId];
    if (!itemDraft) return false;
    return itemDraft.subject !== item.subject
      || itemDraft.body !== item.body
      || itemDraft.linkExpiryMinutes !== (item.linkExpiryMinutes != null ? String(item.linkExpiryMinutes) : '');
  }), [templates, drafts]);

  const unsupportedPlaceholders = useMemo(
    () => (template ? getUnsupportedPlaceholders(template.templateCode, draft.subject, draft.body) : []),
    [template, draft.subject, draft.body],
  );

  // Covers leaving the page entirely (tab close, refresh, typed URL) while any template has an
  // unsaved edit — the browser's own confirmation dialog is the only mechanism available for
  // that; its text isn't customizable by design. In-app navigation via the Email Settings link
  // below is intercepted separately since this can't catch a React Router navigation.
  useEffect(() => {
    if (isReadOnly || !hasAnyUnsavedChanges) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isReadOnly, hasAnyUnsavedChanges]);

  const filteredTemplates = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return templates;
    return templates.filter((item) => templateDisplayLabel(item.templateCode).toLowerCase().includes(needle) || templateDescription(item.templateCode).toLowerCase().includes(needle));
  }, [templates, search]);

  // The editor pane keeps showing the selected template regardless of the search text (it reads
  // from the full `templates` array, not `filteredTemplates`), but the list's own "which one is
  // selected" highlight vanishes the moment a search filters that row out — nothing then shows
  // it's still open. Surface a small pinned indicator instead of leaving that silent.
  const selectedOutsideFilter = Boolean(template) && !filteredTemplates.some((item) => item.templateId === template!.templateId);

  const updateField = <K extends keyof EmailTemplateFormValues>(field: K, value: EmailTemplateFormValues[K]) => {
    if (!template) return;
    if (field === 'subject') setSubjectError(null);
    setDrafts((prev) => ({ ...prev, [template.templateId]: { ...prev[template.templateId], [field]: value } }));
  };

  // Inserts a merge tag at the live cursor position in whichever field was last focused. The
  // Subject field is a plain input, so its selection range is read/restored directly. The Body
  // field is the shared RichTextEditor (contentEditable, no external ref) — inserting there goes
  // through document.execCommand, which respects the current caret as long as focus wasn't
  // stolen by the button first (see its onMouseDown preventDefault below).
  const insertVariable = (token: string) => {
    if (!template) return;
    if (document.activeElement === subjectRef.current) {
      const el = subjectRef.current;
      const text = draft.subject;
      const start = el?.selectionStart ?? text.length;
      const end = el?.selectionEnd ?? text.length;
      const next = `${text.slice(0, start)}${token}${text.slice(end)}`;
      updateField('subject', next);
      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(start + token.length, start + token.length);
      });
      return;
    }

    document.getElementById(BODY_EDITOR_ID)?.focus();
    document.execCommand('insertText', false, token);
  };

  //#region Handlers
  const handleSave = async () => {
    if (!template || isReadOnly) return;
    const isLinkExpiryTemplate = template.templateCode === LINK_EXPIRY_TEMPLATE_CODE;
    const validationErrors = validateEmailTemplate(draft.subject, draft.body, isLinkExpiryTemplate ? draft.linkExpiryMinutes : undefined);
    // Subject errors render inline under the field itself (red border + message, matching the
    // Users module) instead of only a toast — the toast still carries anything else.
    const subjectValidationError = validationErrors.find((message) => message.startsWith('Subject'));
    setSubjectError(subjectValidationError ?? null);
    if (validationErrors.length > 0) {
      const remainingErrors = validationErrors.filter((message) => message !== subjectValidationError);
      if (remainingErrors.length > 0) showToast(remainingErrors, 'error');
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
        linkExpiryMinutes: isLinkExpiryTemplate && draft.linkExpiryMinutes.trim() ? Number(draft.linkExpiryMinutes) : null,
      });
      showToast('Template saved successfully.', 'success');
      await load();
    } catch (error) {
      console.error('Error saving email template:', error);
      showToast(typeof error === 'string' ? error : 'Failed to save email template.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!template || isReadOnly) return;
    const confirmed = await confirmAction({
      title: 'Reset this template?',
      description: 'This template will be restored to its last saved subject and body. Unsaved changes will be lost.',
      confirmLabel: 'Reset template',
      tone: 'danger',
    });
    if (!confirmed) return;
    setDrafts((prev) => ({ ...prev, [template.templateId]: draftFromTemplate(template) }));
    setSubjectError(null);
    showToast('Template reset to last saved version.', 'success');
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

  // Intercepts the in-app "Email Settings" navigation — a React Router <Link> click never fires
  // beforeunload, so unsaved edits would otherwise be silently discarded on leaving this page for
  // another admin screen, exactly as reported.
  const handleEmailSettingsLinkClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hasAnyUnsavedChanges) return;
    event.preventDefault();
    const confirmed = await confirmAction({
      title: 'Discard unsaved changes?',
      description: 'You have unsaved template edits. Leaving this page now will discard them.',
      confirmLabel: 'Discard changes',
      tone: 'danger',
    });
    if (confirmed) navigate('/admin/administration-email-settings');
  };

  //#endregion

  //#region Render
  const TemplateIcon = template ? TEMPLATE_ICON[template.templateCode] ?? Mail : Mail;
  const previewBody = draft.body;

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Email Templates"
        action={(
          <Link to="/admin/administration-email-settings" onClick={(event) => void handleEmailSettingsLinkClick(event)}>
            <CommonButton variant="outline" size="sm" iconLeft={<Settings size={13} />}>Email Settings</CommonButton>
          </Link>
        )}
      />

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
          {selectedOutsideFilter && template ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="admin-email-template-item admin-email-template-item--active admin-email-template-item--pinned"
              title="Still open — clear the search to see it in the list"
            >
              <span className="min-w-0 flex-1">
                <span className="admin-email-template-item__title truncate">{templateDisplayLabel(template.templateCode)}</span>
                <span className="admin-email-template-item__desc">Still open — outside the current search. Click to clear search.</span>
              </span>
            </button>
          ) : null}
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
              const edited = Boolean(itemDraft) && (
                itemDraft.subject !== item.subject
                || itemDraft.body !== item.body
                || itemDraft.linkExpiryMinutes !== (item.linkExpiryMinutes != null ? String(item.linkExpiryMinutes) : '')
              );
              const ItemIcon = TEMPLATE_ICON[item.templateCode] ?? Mail;
              const isActive = item.templateId === selectedId;
              return (
                <button
                  key={item.templateId}
                  type="button"
                  onClick={() => { setSelectedId(item.templateId); setSubjectError(null); }}
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
                    <Badge tone={template.status === 'active' ? 'success' : 'neutral'}>{formatStatusLabel(template.status)}</Badge>
                  </div>
                  <p className="panel-subtitle truncate">{templateDescription(template.templateCode)}</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                {!isReadOnly && (
                  <CommonButton variant="outline" size="sm" iconLeft={<RotateCcw size={13} />} onClick={() => void handleReset()} disabled={!isDirty || saving}>Reset</CommonButton>
                )}
                <CommonButton variant="outline" size="sm" iconLeft={<Eye size={13} />} onClick={() => setPreviewOpen(true)}>Preview</CommonButton>
                <CommonButton variant="outline" size="sm" iconLeft={<Send size={13} />} onClick={() => void handleSendTest()} disabled={sendingTest}>{sendingTest ? 'Sending…' : 'Send Test'}</CommonButton>
                {!isReadOnly && (
                  <CommonButton variant="primary" size="sm" iconLeft={<Save size={13} />} onClick={() => void handleSave()} disabled={!isDirty || saving}>{saving ? 'Saving…' : 'Save'}</CommonButton>
                )}
              </div>
            </div>

            {isReadOnly ? (
              <div className="mx-4 mt-3 flex items-center gap-2 rounded-[var(--radius-panel)] border border-[var(--info)] bg-[var(--info-bg)] p-3">
                <Eye size={14} className="shrink-0 text-[var(--info)]" aria-hidden="true" />
                <p className="text-xs font-semibold text-[var(--info)]">
                  Your role has read-only access to Email Templates — you can view and preview templates, but not edit, save, reset, or send test emails.
                </p>
              </div>
            ) : null}

            {unsupportedPlaceholders.length > 0 ? (
              <div role="alert" className="mx-4 mt-3 flex items-start gap-2 rounded-[var(--radius-panel)] border border-[var(--warning)] bg-[var(--warning-bg)] p-3">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[var(--warning)]" aria-hidden="true" />
                <p className="text-xs font-semibold text-[var(--warning)]">
                  Unsupported placeholder{unsupportedPlaceholders.length > 1 ? 's' : ''} detected: {unsupportedPlaceholders.map((token) => <code key={token} className="mx-0.5">{token}</code>)}.
                  {' '}These aren't merge tags for this template and will be sent to recipients exactly as typed.
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="sm:w-2/5">
                  <SubjectField
                    id="txtEmailTemplateSubject"
                    label="Subject" required
                    ref={subjectRef}
                    value={draft.subject}
                    onChange={(event) => updateField('subject', event.target.value)}
                    placeholder="Enter the email subject line"
                    hint="Shown as the message subject line — keep it short and specific. Most inboxes truncate around 60–78 characters."
                    maxLength={SUBJECT_MAX_LENGTH}
                    error={subjectError ?? undefined}
                    disabled={isReadOnly}
                  />
                  {/* <div className="mt-1 flex justify-end">
                    <CharacterCount id="txtEmailTemplateSubject-counter" length={draft.subject.length} maxLength={SUBJECT_MAX_LENGTH} />
                  </div> */}
                  {template.templateCode === LINK_EXPIRY_TEMPLATE_CODE ? (
                    <div className="mt-3">
                      <SubjectField
                        label="Link expiry (minutes)"
                        type="number"
                        min={MIN_LINK_EXPIRY_MINUTES}
                        max={MAX_LINK_EXPIRY_MINUTES}
                        value={draft.linkExpiryMinutes}
                        onChange={(event) => updateField('linkExpiryMinutes', event.target.value)}
                        placeholder="15"
                        hint={`How long this link stays valid before it expires (${MIN_LINK_EXPIRY_MINUTES}–${MAX_LINK_EXPIRY_MINUTES} minutes). Shown to recipients via the [ExpiryMinutes] merge tag.`}
                        disabled={isReadOnly}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="sm:flex-1">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">
                    <Wand2 size={12} aria-hidden="true" /> Insert Variable
                  </p>
                  <div className="admin-email-tag-group">
                    {(EMAIL_TEMPLATE_VARIABLES[template.templateCode] ?? []).map((variable) => (
                      <Tooltip key={variable.token} content={`${variable.label} — insert at the cursor`} side="top">
                        <button
                          type="button"
                          disabled={isReadOnly}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => insertVariable(variable.token)}
                          className="admin-email-template-tag"
                          aria-label={`Insert ${variable.label} at the cursor`}
                        >
                          <code>{variable.token}</code>
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>

              <RichTextEditor
                id={BODY_EDITOR_ID}
                label="Body"
                value={draft.body}
                onValueChange={(html) => updateField('body', html)}
                placeholder="Enter the email body"
                minHeight={340}
                disabled={isReadOnly}
                helperText="Use the toolbar for formatting, images, tables, and links, or one of the merge tags above to personalize it — click one to insert it at your cursor."
              />
            </div>
          </section>
        ) : null}
      </div>

      {template ? (
        <BaseModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={`Preview — ${templateDisplayLabel(template.templateCode)}`}
          size="2xl"
          height="full"
        >
          <div className="flex flex-col gap-2">
            <div className="admin-email-preview-shell">
              <div
                className="admin-email-preview-card"
                onClick={(event) => { if ((event.target as HTMLElement).closest('a')) event.preventDefault(); }}
              >
                <div className="admin-email-preview-card__meta">
                  <div className="admin-email-preview-card__meta-row">
                    <span className="admin-email-preview-card__meta-label">To</span>
                    <span className="admin-email-preview-card__meta-value">{storedAuthEmail || '—'}</span>
                  </div>
                  <div className="admin-email-preview-card__meta-row">
                    <span className="admin-email-preview-card__meta-label">Subject</span>
                    <span className="admin-email-preview-card__meta-value">{draft.subject || 'Untitled subject'}</span>
                  </div>
                </div>
                {draft.body ? (
                  // Mirrors SMTPMailService.FormatMailContent's actual send-time wrapper (gradient
                  // band, brand header, white content card, disclaimer footer) so this preview
                  // matches the real email structure, not just the raw body in isolation. Keep in
                  // sync with that method if its wrapper markup changes. Branding (font, size,
                  // accent color) is platform-wide now — set on the Email Settings page, not here —
                  // so the preview renders with the shell's defaults rather than per-template
                  // overrides, but the logo image itself is the same one configured there, so the
                  // preview matches exactly what recipients see.
                  <div className="admin-email-preview-card__envelope">
                    {logoImageUrl && !logoImageFailed ? (
                      <div className="admin-email-preview-card__logo-image">
                        <img
                          src={logoImageUrl}
                          alt="Catholic Solutions"
                          // A broken/404'd logo URL would otherwise show the browser's own
                          // broken-image icon at the top of every preview (and every real sent
                          // email) — fall back to the same intentional text brand mark used when
                          // no logo is configured at all, rather than a visibly broken image.
                          onError={() => setLogoImageFailed(true)}
                        />
                      </div>
                    ) : (
                      <div className="admin-email-preview-card__brand">Catholic Solutions</div>
                    )}
                    <div className="admin-email-preview-card__content">
                      <div className="admin-email-preview-card__body" dangerouslySetInnerHTML={{ __html: previewBody }} />
                      <div className="admin-email-preview-card__disclaimer">
                        <span>Disclaimer</span>
                        <p>Please do not respond directly to this email. The originating email is not monitored.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="px-4 pb-4 text-xs italic text-[var(--text-faint)]">Start typing the body to see it rendered here.</p>
                )}
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
              <CheckCircle2 size={12} className="shrink-0" aria-hidden="true" />
              Preview shows the subject and body as written, using the platform's shared branding. Merge tags stay as placeholders until a real send fills them in.
            </p>
          </div>
        </BaseModal>
      ) : null}
    </div>
  );
  //#endregion
}

export default EmailTemplatesPage;
