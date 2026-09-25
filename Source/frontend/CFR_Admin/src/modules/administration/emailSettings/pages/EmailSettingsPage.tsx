import { useEffect, useRef, useState } from 'react';
import { PlugZap, RotateCcw, Save } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@/modules/authentication/hooks/useFeatureAccessLevel';
import { CommonButton } from '@app/components/buttons';
import { CommonSwitch, InputField, MandatoryIndicator, ProfileImageUpload } from '@app/components/formControls';
import { confirmAction } from '../../../lib/confirm';
import { formatDateTime } from '../../../utils/formatDate';
import { getEmailSettings, removeEmailLogo, saveEmailSettings, testSmtpConnection, uploadEmailLogo } from '../services/emailSettingsService';
import type { EmailSettingsApiItem, EmailSettingsFormValues, TestSmtpConnectionResult } from '../types/emailSettingsTypes';
import { formFromEmailSettings, payloadFromForm } from '../utils/emailSettingsHelpers';
import type { EmailSettingsFieldErrors } from '../validator/EmailSettingsValidator';
import { validateEmailSettingsFields } from '../validator/EmailSettingsValidator';

const SECTION_LABEL_CLASS = 'mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]';
const SECTION_HINT_CLASS = 'mb-3 text-xs text-[var(--text-muted)]';
const SMTP_TEST_SUCCESS_MESSAGE = 'SMTP connection successful.';
const SMTP_TEST_FAILURE_MESSAGE = 'SMTP connection failed. Please verify server, port, credentials, and SSL/TLS settings.';

// Order to check when scrolling to the first invalid field on Save — top-to-bottom as the fields
// appear in the form below.
const FIELD_FOCUS_ORDER: Array<keyof EmailSettingsFormValues> = [
  'smtpServer', 'smtpPort', 'username', 'ccMailId', 'contactUsMailId',
];

// Fields that affect what an actual SMTP handshake would use — editing any of these invalidates an
// earlier successful Test Connection result, since it no longer reflects the current form values.
const SMTP_RELEVANT_FIELDS: Array<keyof EmailSettingsFormValues> = ['smtpServer', 'smtpPort', 'username', 'password', 'isSslEnabled'];

const fieldElementId = (field: keyof EmailSettingsFormValues): string => `email-settings-${field}`;

function EmailSettingsPage() {
  //#region Hooks
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel('/admin/administration-email-settings');
  const isReadOnly = accessLevel === 'readOnly';
  //#endregion

  //#region States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [form, setForm] = useState<EmailSettingsFormValues>(formFromEmailSettings(null));
  const [originalForm, setOriginalForm] = useState<EmailSettingsFormValues>(formFromEmailSettings(null));
  const [fieldErrors, setFieldErrors] = useState<EmailSettingsFieldErrors>({});
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [smtpTested, setSmtpTested] = useState(false);
  const [lastUpdatedByName, setLastUpdatedByName] = useState<string | null>(null);
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);
  const isDirtyRef = useRef(false);
  //#endregion

  const isDirty = JSON.stringify(form) !== JSON.stringify(originalForm);

  //#region Effects
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { resultData } = await getEmailSettings();
        if (cancelled) return;
        const item = (resultData ?? null) as EmailSettingsApiItem | null;
        const newForm = formFromEmailSettings(item);
        setForm(newForm);
        setOriginalForm(newForm);
        setHasPassword(Boolean(item?.hasPassword));
        setLogoImageUrl(item?.logoImageUrl ?? null);
        setLastUpdatedByName(item?.lastUpdatedByName ?? null);
        setLastUpdatedDate(item?.lastUpdatedDate ?? null);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading email settings:', error);
        showToast('Failed to load email settings.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only fetch
  }, []);

  // Covers leaving the page entirely (tab close, refresh, typed URL) while there are unsaved
  // changes — the browser's own confirmation dialog is the only mechanism available for that; its
  // text isn't customizable by design. There's no in-app link away from this page to intercept.
  useEffect(() => {
    if (isReadOnly) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isReadOnly]);
  //#endregion

  const updateField = <K extends keyof EmailSettingsFormValues>(field: K, value: EmailSettingsFormValues[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    if (SMTP_RELEVANT_FIELDS.includes(field)) setSmtpTested(false);
  };

  //#region Handlers
  const focusFirstInvalidField = (errors: EmailSettingsFieldErrors) => {
    const firstField = FIELD_FOCUS_ORDER.find((field) => errors[field]);
    if (!firstField) return;
    const element = document.getElementById(fieldElementId(firstField));
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.focus({ preventScroll: true });
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    const errors = validateEmailSettingsFields(form);
    setFieldErrors(errors);
    const errorMessages = Object.values(errors).filter((value): value is string => Boolean(value));
    if (errorMessages.length > 0) {
      showToast(errorMessages, 'error');
      focusFirstInvalidField(errors);
      return;
    }

    setSaving(true);
    try {
      await saveEmailSettings(payloadFromForm(form));
      showToast('Email settings saved.', 'success');
      setHasPassword(hasPassword || Boolean(form.password.trim()));
      const newForm = { ...form, password: '' };
      setForm(newForm);
      setOriginalForm(newForm);
      // Re-fetch just the audit stamp so "Last updated by/at" reflects the save that just
      // happened — left showing the previous stamp until this resolves, rather than blanking it
      // first, so the line doesn't flicker away and back.
      try {
        const { resultData } = await getEmailSettings();
        const item = (resultData ?? null) as EmailSettingsApiItem | null;
        setLastUpdatedByName(item?.lastUpdatedByName ?? null);
        setLastUpdatedDate(item?.lastUpdatedDate ?? null);
      } catch {
        // Non-fatal — the save itself already succeeded and was confirmed by the toast above.
      }
    } catch (error) {
      console.error('Error saving email settings:', error);
      showToast(typeof error === 'string' ? error : 'Failed to save email settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (isReadOnly || !isDirty) return;
    const confirmed = await confirmAction({
      title: 'Discard changes?',
      description: 'Discard your unsaved Email Settings changes?',
      confirmLabel: 'Discard changes',
      tone: 'danger',
    });
    if (!confirmed) return;
    setForm(originalForm);
    setFieldErrors({});
  };

  const handleTestConnection = async () => {
    if (isReadOnly) return;
    const errors = validateEmailSettingsFields(form);
    const smtpErrors: EmailSettingsFieldErrors = {
      smtpServer: errors.smtpServer,
      smtpPort: errors.smtpPort,
      username: errors.username,
    };
    setFieldErrors((prev) => ({ ...prev, ...smtpErrors }));
    const smtpErrorMessages = Object.values(smtpErrors).filter((value): value is string => Boolean(value));
    if (smtpErrorMessages.length > 0) {
      showToast(smtpErrorMessages, 'error');
      focusFirstInvalidField(smtpErrors);
      return;
    }

    setTestingConnection(true);
    try {
      const { resultData } = await testSmtpConnection(payloadFromForm(form));
      const success = Boolean((resultData as TestSmtpConnectionResult | null)?.success);
      setSmtpTested(success);
      showToast(success ? SMTP_TEST_SUCCESS_MESSAGE : SMTP_TEST_FAILURE_MESSAGE, success ? 'success' : 'error');
    } catch (error) {
      console.error('Error testing SMTP connection:', error);
      setSmtpTested(false);
      showToast(typeof error === 'string' ? error : SMTP_TEST_FAILURE_MESSAGE, 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleRemoveLogoConfirm = async (): Promise<boolean> => confirmAction({
    title: 'Remove Email Logo?',
    description: 'Are you sure you want to remove the Email Logo?',
    confirmLabel: 'Remove Logo',
    tone: 'danger',
  });

  const handleLogoFileChange = async (file: File | null) => {
    if (isReadOnly) return;
    if (!file) {
      const previousLogoUrl = logoImageUrl;
      setLogoImageUrl(null);
      try {
        await removeEmailLogo();
        showToast('Email logo removed.', 'success');
      } catch (error) {
        console.error('Error removing email logo:', error);
        setLogoImageUrl(previousLogoUrl);
        showToast(typeof error === 'string' ? error : 'Failed to remove email logo.', 'error');
      }
      return;
    }

    setUploadingLogo(true);
    try {
      const { resultData } = await uploadEmailLogo(file);
      const item = (resultData ?? null) as EmailSettingsApiItem | null;
      setLogoImageUrl(item?.logoImageUrl ?? null);
      showToast('Email logo uploaded.', 'success');
    } catch (error) {
      console.error('Error uploading email logo:', error);
      showToast(typeof error === 'string' ? error : 'Failed to upload email logo.', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  //#endregion

  //#region Render
  if (loading) {
    return (
      <div className="admin-reveal flex flex-col gap-4">
        <PanelHeader title="Email Settings" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="admin-skeleton h-9 w-full rounded-[var(--radius-control)]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Email Settings" action={<MandatoryIndicator variant="brand" />} />

      {isReadOnly ? <ReadOnlyBanner featureName="Email Settings" /> : null}

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
        className="flex flex-col gap-4"
      >
        <div>
          <p className={SECTION_LABEL_CLASS}>SMTP Server</p>
          <p className={SECTION_HINT_CLASS}>Applies platform-wide — CFR, CFR Admin, and every other Catholic Solutions app send their emails (password reset, welcome, access and product requests, and decisions) through this one configuration.</p>

          <div className="flex flex-col gap-3">
            <CommonSwitch
              label="Send mail enabled"
              checked={form.sendMailEnabled}
              onCheckedChange={(value) => updateField('sendMailEnabled', value)}
              helperText={form.sendMailEnabled && !smtpTested && !isReadOnly ? 'Tip: run Test Connection to confirm these SMTP settings work before relying on email delivery.' : undefined}
              disabled={saving || isReadOnly}
            />

            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
              <InputField
                id={fieldElementId('smtpServer')} label="SMTP server" required
                value={form.smtpServer}
                onChange={(event) => updateField('smtpServer', event.target.value)}
                placeholder="smtp.example.com"
                maxLength={300}
                disabled={saving || isReadOnly}
                error={fieldErrors.smtpServer}
              />
              <InputField
                id={fieldElementId('smtpPort')} label="SMTP port" type="number" min={1} max={65535}
                value={form.smtpPort}
                onChange={(event) => updateField('smtpPort', event.target.value)}
                placeholder="587"
                disabled={saving || isReadOnly}
                error={fieldErrors.smtpPort}
              />
              <InputField label="Display name" value={form.displayName} onChange={(event) => updateField('displayName', event.target.value)} placeholder="Catholic Solutions" maxLength={255} disabled={saving || isReadOnly} />
              <InputField
                id={fieldElementId('username')} label="Username" required
                value={form.username}
                onChange={(event) => updateField('username', event.target.value)}
                placeholder="notifications@example.com"
                helperText="Some SMTP providers use a non-email username — enter it exactly as issued."
                maxLength={255}
                disabled={saving || isReadOnly}
                error={fieldErrors.username}
              />
              <InputField
                label="Password" type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                placeholder={hasPassword ? '••••••••  (leave blank to keep current)' : 'Enter a password'}
                helperText={hasPassword ? 'A password is already set — leave this blank to keep it unchanged.' : 'No password is set yet.'}
                disabled={saving || isReadOnly}
              />
              <InputField
                id={fieldElementId('ccMailId')} label="CC address" type="email"
                value={form.ccMailId}
                onChange={(event) => updateField('ccMailId', event.target.value)}
                placeholder="cc@example.com"
                maxLength={255}
                disabled={saving || isReadOnly}
                error={fieldErrors.ccMailId}
              />
              <InputField
                id={fieldElementId('contactUsMailId')} label="Contact us address" type="email"
                value={form.contactUsMailId}
                onChange={(event) => updateField('contactUsMailId', event.target.value)}
                placeholder="support@example.com"
                maxLength={255}
                disabled={saving || isReadOnly}
                error={fieldErrors.contactUsMailId}
              />
            </div>

            <CommonSwitch label="SSL/TLS enabled" checked={form.isSslEnabled} onCheckedChange={(value) => updateField('isSslEnabled', value)} disabled={saving || isReadOnly} />

            {!isReadOnly && (
              <div>
                <CommonButton
                  type="button" variant="outline" size="sm"
                  iconLeft={<PlugZap size={14} />}
                  loading={testingConnection}
                  disabled={testingConnection || saving}
                  onClick={() => void handleTestConnection()}
                >
                  Test Connection
                </CommonButton>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--line-soft)] pt-4">
          <p className={SECTION_LABEL_CLASS}>Email Logo</p>
          <p className={SECTION_HINT_CLASS}>Shown at the top of every outgoing email and in the Email Templates preview.</p>

          <ProfileImageUpload
            label="Email logo"
            variant="rectangle"
            uploadLabel="Upload Email Logo"
            replaceLabel="Change Email Logo"
            existingPreviewAlt="Current Email Logo"
            previewAriaLabel="Preview Email Logo"
            removeAriaLabel="Remove Email Logo"
            confirmRemove={handleRemoveLogoConfirm}
            initialPreviewUrl={logoImageUrl ?? undefined}
            onFileChange={(file) => void handleLogoFileChange(file)}
            disabled={uploadingLogo || saving || isReadOnly}
            helperText="JPG or PNG, up to 2MB. Leave empty to show a text brand mark instead."
          />
        </div>

        {(lastUpdatedByName || lastUpdatedDate) && (
          <p className="text-xs text-[var(--text-muted)]">
            {lastUpdatedByName ? `Last updated by: ${lastUpdatedByName}` : null}
            {lastUpdatedByName && lastUpdatedDate ? ' · ' : null}
            {lastUpdatedDate ? `Last updated at: ${formatDateTime(lastUpdatedDate)}` : null}
          </p>
        )}

        {!isReadOnly && (
          <div className="admin-sticky-footer flex items-center gap-2">
            <CommonButton type="submit" variant="primary" size="sm" iconLeft={<Save size={14} />} loading={saving} disabled={saving || !isDirty}>Save</CommonButton>
            <CommonButton type="button" variant="outline" size="sm" iconLeft={<RotateCcw size={14} />} onClick={() => void handleReset()} disabled={!isDirty || saving}>Reset</CommonButton>
          </div>
        )}
      </form>
    </div>
  );
  //#endregion
}

export default EmailSettingsPage;
