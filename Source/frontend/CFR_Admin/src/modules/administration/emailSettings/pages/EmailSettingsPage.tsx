import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@shared/auth/hooks/useFeatureAccessLevel';
import { CommonButton } from '@app/components/buttons';
import { ColorPicker, CommonSwitch, Dropdown, InputField, MandatoryIndicator, ProfileImageUpload } from '@app/components/formControls';
import { getEmailSettings, removeEmailLogo, saveEmailSettings, uploadEmailLogo } from '../services/emailSettingsService';
import type { EmailSettingsApiItem, EmailSettingsFormValues } from '../types/emailSettingsTypes';
import { DEFAULT_EMAIL_ACCENT_COLOR, DEFAULT_EMAIL_FONT_FAMILY, EMAIL_FONT_FAMILY_OPTIONS, formFromEmailSettings, payloadFromForm } from '../utils/emailSettingsHelpers';
import { validateEmailSettings } from '../validator/EmailSettingsValidator';

const SECTION_LABEL_CLASS = 'mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]';
const SECTION_HINT_CLASS = 'mb-3 text-xs text-[var(--text-muted)]';

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
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { resultData } = await getEmailSettings();
        if (cancelled) return;
        const item = (resultData ?? null) as EmailSettingsApiItem | null;
        setForm(formFromEmailSettings(item));
        setHasPassword(Boolean(item?.hasPassword));
        setLogoImageUrl(item?.logoImageUrl ?? null);
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
  //#endregion

  const updateField = <K extends keyof EmailSettingsFormValues>(field: K, value: EmailSettingsFormValues[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  //#region Handlers
  const handleSave = async () => {
    if (isReadOnly) return;
    const validationErrors = validateEmailSettings(form);
    if (validationErrors.length > 0) {
      showToast(validationErrors, 'error');
      return;
    }

    setSaving(true);
    try {
      await saveEmailSettings(payloadFromForm(form));
      showToast('Email settings saved.', 'success');
      setHasPassword(hasPassword || Boolean(form.password.trim()));
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (error) {
      console.error('Error saving email settings:', error);
      showToast(typeof error === 'string' ? error : 'Failed to save email settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

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
          <p className={SECTION_HINT_CLASS}>Shared by every outgoing email — password reset, welcome, access request, and access decision messages all send through this configuration.</p>

          <div className="flex flex-col gap-3">
            <CommonSwitch label="Send mail enabled" checked={form.sendMailEnabled} onCheckedChange={(value) => updateField('sendMailEnabled', value)} disabled={saving || isReadOnly} />

            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
              <InputField label="SMTP server" required value={form.smtpServer} onChange={(event) => updateField('smtpServer', event.target.value)} placeholder="smtp.example.com" disabled={saving || isReadOnly} />
              <InputField label="SMTP port" type="number" value={form.smtpPort} onChange={(event) => updateField('smtpPort', event.target.value)} placeholder="587" disabled={saving || isReadOnly} />
              <InputField label="Display name" value={form.displayName} onChange={(event) => updateField('displayName', event.target.value)} placeholder="Catholic Solutions" disabled={saving || isReadOnly} />
              <InputField label="Username" required value={form.username} onChange={(event) => updateField('username', event.target.value)} placeholder="notifications@example.com" disabled={saving || isReadOnly} />
              <InputField
                label="Password" type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                placeholder={hasPassword ? '••••••••  (leave blank to keep current)' : 'Enter a password'}
                helperText={hasPassword ? 'A password is already set — leave this blank to keep it unchanged.' : 'No password is set yet.'}
                disabled={saving || isReadOnly}
              />
              <InputField label="CC address" value={form.ccMailId} onChange={(event) => updateField('ccMailId', event.target.value)} placeholder="cc@example.com" disabled={saving || isReadOnly} />
              <InputField label="Contact us address" value={form.contactUsMailId} onChange={(event) => updateField('contactUsMailId', event.target.value)} placeholder="support@example.com" disabled={saving || isReadOnly} />
              <InputField
                label="API base URL"
                value={form.apiBaseUrl}
                onChange={(event) => updateField('apiBaseUrl', event.target.value)}
                placeholder="https://api.example.org/acutis"
                helperText="This API's own public address (not the admin site's URL) — used to build the email logo's image link. Must be reachable by recipients' email clients, so never a localhost or private-network address, even while testing locally."
                disabled={saving || isReadOnly}
                wrapperClassName="sm:col-span-2"
              />
            </div>

            <CommonSwitch label="SSL/TLS enabled" checked={form.isSslEnabled} onCheckedChange={(value) => updateField('isSslEnabled', value)} disabled={saving || isReadOnly} />
          </div>
        </div>

        <div className="border-t border-[var(--line-soft)] pt-4">
          <p className={SECTION_LABEL_CLASS}>Branding</p>
          <p className={SECTION_HINT_CLASS}>Applied to every email template — logo, accent color, font, and size are no longer set per-template.</p>

          <div className="flex flex-col gap-4">
            <ProfileImageUpload
              label="Email logo"
              initialPreviewUrl={logoImageUrl ?? undefined}
              onFileChange={(file) => void handleLogoFileChange(file)}
              disabled={uploadingLogo || saving || isReadOnly}
              helperText="JPG or PNG, up to 2MB. Shown at the top of every outgoing email — leave empty to show a text brand mark instead."
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className={isReadOnly ? 'pointer-events-none opacity-60' : undefined}>
                <ColorPicker label="Accent color" value={form.accentColor} onChange={(value) => updateField('accentColor', value ?? DEFAULT_EMAIL_ACCENT_COLOR)} enableNativePicker />
              </div>
              <InputField
                label="Base font size (px)" type="number"
                value={form.baseFontSize}
                onChange={(event) => updateField('baseFontSize', event.target.value)}
                disabled={saving || isReadOnly}
              />
              <Dropdown
                label="Font family"
                searchable={false}
                clearable={false}
                value={form.fontFamily}
                onValueChange={(value) => updateField('fontFamily', value ?? DEFAULT_EMAIL_FONT_FAMILY)}
                options={EMAIL_FONT_FAMILY_OPTIONS}
                disabled={saving || isReadOnly}
              />
            </div>
          </div>
        </div>

        {!isReadOnly && (
          <div className="admin-sticky-footer">
            <CommonButton type="submit" variant="primary" size="sm" iconLeft={<Save size={14} />} loading={saving} disabled={saving}>Save</CommonButton>
          </div>
        )}
      </form>
    </div>
  );
  //#endregion
}

export default EmailSettingsPage;
