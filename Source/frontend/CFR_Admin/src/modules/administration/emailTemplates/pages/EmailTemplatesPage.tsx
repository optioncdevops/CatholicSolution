import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Eye, KeyRound, Mail, MailCheck, MailQuestion, Palette, RotateCcw, Save, Search, Send, Sparkles, Wand2,
} from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { Badge } from '@app/components/Badge';
import { BaseModal } from '@app/components/modal/BaseModal';
import { ColorPicker, Dropdown, InputField, RichTextEditor } from '@app/components/formControls';
// The ported formControls InputField doesn't forward a ref to the underlying element, which the
// merge-tag "insert at cursor" feature below needs for the Subject field — keep the local
// ref-forwarding one. The Body field is now the shared RichTextEditor (WYSIWYG, standard
// bold/italic/lists/links/color/image/table toolbar) instead of a raw-HTML textarea.
import { InputField as SubjectField } from '@app/components/form/TextField';
import { getStoredAcutisAuth } from '@shared/auth/services/authService';
import { confirmAction } from '../../../lib/confirm';
import { getEmailTemplates, saveEmailTemplate, sendTestEmail } from '../services/emailTemplatesService';
import type { EmailTemplateApiItem, EmailTemplateFormValues } from '../types/emailTemplatesTypes';
import {
  DEFAULT_EMAIL_ACCENT_COLOR, DEFAULT_EMAIL_BASE_FONT_SIZE, DEFAULT_EMAIL_FONT_FAMILY, EMAIL_FONT_FAMILY_OPTIONS,
  EMAIL_TEMPLATE_VARIABLES, getUnsupportedPlaceholders, normalizeEmailTemplatesList, templateDescription, templateDisplayLabel,
} from '../utils/emailTemplatesHelpers';
import { validateEmailTemplate } from '../validator/EmailTemplatesValidator';

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
  accentColor: item.accentColor || DEFAULT_EMAIL_ACCENT_COLOR,
  logoUrl: item.logoUrl ?? '',
  fontFamily: item.fontFamily || DEFAULT_EMAIL_FONT_FAMILY,
  baseFontSize: item.baseFontSize || DEFAULT_EMAIL_BASE_FONT_SIZE,
});

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
  const [previewOpen, setPreviewOpen] = useState(false);
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
  //#endregion

  const template = useMemo(() => templates.find((item) => item.templateId === selectedId) ?? null, [templates, selectedId]);
  const draft = (template ? drafts[template.templateId] : undefined) ?? {
    subject: '', body: '', accentColor: DEFAULT_EMAIL_ACCENT_COLOR, logoUrl: '', fontFamily: DEFAULT_EMAIL_FONT_FAMILY, baseFontSize: DEFAULT_EMAIL_BASE_FONT_SIZE,
  };
  const isDirty = Boolean(template) && (
    draft.subject !== template!.subject
    || draft.body !== template!.body
    || draft.accentColor !== (template!.accentColor || DEFAULT_EMAIL_ACCENT_COLOR)
    || draft.logoUrl !== (template!.logoUrl ?? '')
    || draft.fontFamily !== (template!.fontFamily || DEFAULT_EMAIL_FONT_FAMILY)
    || draft.baseFontSize !== (template!.baseFontSize || DEFAULT_EMAIL_BASE_FONT_SIZE)
  );
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

  const updateField = <K extends keyof EmailTemplateFormValues>(field: K, value: EmailTemplateFormValues[K]) => {
    if (!template) return;
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
        accentColor: draft.accentColor,
        logoUrl: draft.logoUrl,
        fontFamily: draft.fontFamily,
        baseFontSize: draft.baseFontSize,
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
      description: `"${templateDisplayLabel(template.templateCode)}" will be restored to its last saved subject, body, and branding. Unsaved changes will be lost.`,
      confirmLabel: 'Reset template',
      tone: 'danger',
    });
    if (!confirmed) return;
    setDrafts((prev) => ({ ...prev, [template.templateId]: draftFromTemplate(template) }));
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
        accentColor: draft.accentColor,
        logoUrl: draft.logoUrl,
        fontFamily: draft.fontFamily,
        baseFontSize: draft.baseFontSize,
      });
      showToast(`Test email sent to ${toAddress}.`, 'success');
    } catch (error) {
      console.error('Error sending test email:', error);
      showToast(typeof error === 'string' ? error : 'Failed to send test email.', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  //#endregion

  //#region Render
  const TemplateIcon = template ? TEMPLATE_ICON[template.templateCode] ?? Mail : Mail;
  // Preview-only substitution of [AccentColor] so the color picker has a visible live effect —
  // every other merge tag intentionally stays a literal placeholder until a real send fills it in.
  const previewBody = draft.body.replaceAll('[AccentColor]', draft.accentColor || DEFAULT_EMAIL_ACCENT_COLOR);

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
              const edited = Boolean(itemDraft) && (
                itemDraft.subject !== item.subject
                || itemDraft.body !== item.body
                || itemDraft.accentColor !== (item.accentColor || DEFAULT_EMAIL_ACCENT_COLOR)
                || itemDraft.logoUrl !== (item.logoUrl ?? '')
                || itemDraft.fontFamily !== (item.fontFamily || DEFAULT_EMAIL_FONT_FAMILY)
                || itemDraft.baseFontSize !== (item.baseFontSize || DEFAULT_EMAIL_BASE_FONT_SIZE)
              );
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

              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <CommonButton variant="outline" size="sm" iconLeft={<RotateCcw size={13} />} onClick={() => void handleReset()} disabled={!isDirty || saving}>Reset</CommonButton>
                <CommonButton variant="outline" size="sm" iconLeft={<Eye size={13} />} onClick={() => setPreviewOpen(true)}>Preview</CommonButton>
                <CommonButton variant="outline" size="sm" iconLeft={<Send size={13} />} onClick={() => void handleSendTest()} disabled={sendingTest}>{sendingTest ? 'Sending…' : 'Send Test'}</CommonButton>
                <CommonButton variant="primary" size="sm" iconLeft={<Save size={13} />} onClick={() => void handleSave()} disabled={!isDirty || saving}>{saving ? 'Saving…' : 'Save'}</CommonButton>
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

            <div className="flex flex-col gap-4 p-4">
              <SubjectField
                label="Subject" required
                ref={subjectRef}
                value={draft.subject}
                onChange={(event) => updateField('subject', event.target.value)}
                placeholder="Enter the email subject line"
                hint="Shown as the message subject line — keep it short and specific."
              />
              <div>
                <RichTextEditor
                  id={BODY_EDITOR_ID}
                  label="Body"
                  value={draft.body}
                  onValueChange={(html) => updateField('body', html)}
                  placeholder="Enter the email body"
                  minHeight={340}
                  helperText="Use the toolbar for formatting, images, tables, and links, or one of the merge tags below to personalize it — click one to insert it at your cursor."
                />
                <div className="mt-2">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">
                    <Wand2 size={12} aria-hidden="true" /> Insert Variable
                  </p>
                  <div className="admin-email-tag-group">
                    {(EMAIL_TEMPLATE_VARIABLES[template.templateCode] ?? []).map((variable) => (
                      <button
                        key={variable.token}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
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

              <div className="admin-email-branding">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">
                  <Palette size={12} aria-hidden="true" /> Branding
                </p>
                <p className="mb-2 text-xs text-[var(--text-muted)]">
                  These settings only style <strong>{templateDisplayLabel(template.templateCode)}</strong> — each template has its own accent color, font, and size, so changing them here doesn't affect any other template.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <ColorPicker
                    label="Accent color"
                    value={draft.accentColor}
                    onChange={(value) => updateField('accentColor', value ?? DEFAULT_EMAIL_ACCENT_COLOR)}
                    enableNativePicker
                  />

                  <label className="admin-email-branding__field">
                    <span>Base font size (px)</span>
                    <input
                      type="number"
                      min={10}
                      max={24}
                      value={draft.baseFontSize}
                      onChange={(event) => updateField('baseFontSize', Number(event.target.value) || DEFAULT_EMAIL_BASE_FONT_SIZE)}
                      className="admin-email-branding__number"
                    />
                  </label>

                  <label className="admin-email-branding__field">
                    <span>Font family</span>
                    <Dropdown
                      label="Font family" hideLabel
                      searchable={false}
                      clearable={false}
                      value={draft.fontFamily}
                      onValueChange={(value) => updateField('fontFamily', value ?? DEFAULT_EMAIL_FONT_FAMILY)}
                      options={EMAIL_FONT_FAMILY_OPTIONS}
                      className="min-h-8"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      {template ? (
        <BaseModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={`Preview — ${templateDisplayLabel(template.templateCode)}`}
          size="lg"
          height="lg"
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
                </div>
                <p className="admin-email-preview-card__subject">{draft.subject || 'Untitled subject'}</p>
                {draft.body ? (
                  // Mirrors SMTPMailService.FormatMailContent's actual send-time wrapper (gradient
                  // band, brand header, white content card, disclaimer footer) so this preview
                  // matches the real email structure, not just the raw body in isolation. Keep in
                  // sync with that method if its wrapper markup changes. [AccentColor] is
                  // substituted here for the live preview only — every other merge tag stays literal.
                  <div className="admin-email-preview-card__envelope" style={{ fontFamily: draft.fontFamily, fontSize: `${draft.baseFontSize}px` }}>
                    {draft.logoUrl ? (
                      <div className="admin-email-preview-card__logo-image">
                        <img src={draft.logoUrl} alt={templateDisplayLabel(template.templateCode)} />
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
              Preview shows the template and branding as written. [AccentColor] is filled in live; other merge tags stay as placeholders until a real send fills them in.
            </p>
          </div>
        </BaseModal>
      ) : null}
    </div>
  );
  //#endregion
}

export default EmailTemplatesPage;
