import type { EmailSettingsApiItem, EmailSettingsFormValues, SaveEmailSettingsPayload } from '../types/emailSettingsTypes';

// Web-safe stacks only — HTML email clients don't reliably load custom web fonts.
export const EMAIL_FONT_FAMILY_OPTIONS: Array<{ id: string; value: string }> = [
  { id: 'Verdana, Arial, Helvetica, sans-serif', value: 'Verdana' },
  { id: "'Segoe UI', Helvetica, Arial, sans-serif", value: 'Segoe UI' },
  { id: 'Arial, Helvetica, sans-serif', value: 'Arial' },
  { id: "Georgia, 'Times New Roman', serif", value: 'Georgia' },
  { id: "'Trebuchet MS', Helvetica, sans-serif", value: 'Trebuchet MS' },
];

export const DEFAULT_EMAIL_FONT_FAMILY = EMAIL_FONT_FAMILY_OPTIONS[0].id;
export const DEFAULT_EMAIL_ACCENT_COLOR = '#1d4ed8';
export const DEFAULT_EMAIL_BASE_FONT_SIZE = 13;

export const formFromEmailSettings = (item: EmailSettingsApiItem | null): EmailSettingsFormValues => ({
  sendMailEnabled: item?.sendMailEnabled ?? false,
  smtpServer: item?.smtpServer ?? '',
  smtpPort: item?.smtpPort ? String(item.smtpPort) : '',
  displayName: item?.displayName ?? '',
  username: item?.username ?? '',
  password: '',
  isSslEnabled: item?.isSslEnabled ?? false,
  ccMailId: item?.ccMailId ?? '',
  contactUsMailId: item?.contactUsMailId ?? '',
  accentColor: item?.accentColor || DEFAULT_EMAIL_ACCENT_COLOR,
  fontFamily: item?.fontFamily || DEFAULT_EMAIL_FONT_FAMILY,
  baseFontSize: item?.baseFontSize ? String(item.baseFontSize) : String(DEFAULT_EMAIL_BASE_FONT_SIZE),
  apiBaseUrl: item?.apiBaseUrl ?? '',
});

export const payloadFromForm = (form: EmailSettingsFormValues): SaveEmailSettingsPayload => ({
  sendMailEnabled: form.sendMailEnabled,
  smtpServer: form.smtpServer.trim(),
  smtpPort: Number(form.smtpPort) || 0,
  displayName: form.displayName.trim(),
  username: form.username.trim(),
  ...(form.password.trim() ? { password: form.password.trim() } : {}),
  isSslEnabled: form.isSslEnabled,
  ccMailId: form.ccMailId.trim(),
  contactUsMailId: form.contactUsMailId.trim(),
  accentColor: form.accentColor || DEFAULT_EMAIL_ACCENT_COLOR,
  fontFamily: form.fontFamily || DEFAULT_EMAIL_FONT_FAMILY,
  baseFontSize: Number(form.baseFontSize) || DEFAULT_EMAIL_BASE_FONT_SIZE,
  apiBaseUrl: form.apiBaseUrl.trim(),
});
