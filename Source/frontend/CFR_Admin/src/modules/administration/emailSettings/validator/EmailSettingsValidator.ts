import type { EmailSettingsFormValues } from '../types/emailSettingsTypes';

// Same shape as the Users module's UsersValidator.ts eMail pattern — one email-format rule
// reused everywhere a plain email address is accepted in this app.
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export type EmailSettingsFieldErrors = Partial<Record<keyof EmailSettingsFormValues, string>>;

// This screen edits a single, always-existing file-backed settings row (no add/delete), so it
// uses plain controlled inputs rather than react-hook-form — checked directly before Save.
// Returns per-field errors (for inline display) rather than a flat list, so each InputField can
// bind its own `error` prop directly.
export const validateEmailSettingsFields = (form: EmailSettingsFormValues): EmailSettingsFieldErrors => {
  const errors: EmailSettingsFieldErrors = {};

  if (!form.smtpServer.trim()) errors.smtpServer = 'SMTP server is required.';
  if (!form.username.trim()) errors.username = 'Username is required.';

  if (form.smtpPort.trim() && (Number(form.smtpPort) <= 0 || Number(form.smtpPort) > 65535 || !Number.isInteger(Number(form.smtpPort)))) {
    errors.smtpPort = 'SMTP port must be a whole number between 1 and 65535.';
  }

  if (form.baseFontSize.trim() && (Number(form.baseFontSize) < 10 || Number(form.baseFontSize) > 24)) {
    errors.baseFontSize = 'Base font size must be between 10 and 24.';
  }

  const ccMailId = form.ccMailId.trim();
  if (ccMailId && !EMAIL_PATTERN.test(ccMailId)) {
    errors.ccMailId = 'Enter a valid email address.';
  }

  const contactUsMailId = form.contactUsMailId.trim();
  if (contactUsMailId && !EMAIL_PATTERN.test(contactUsMailId)) {
    errors.contactUsMailId = 'Enter a valid email address.';
  }

  // apiBaseUrl is edited on the CFR Settings page now, not here — this form just round-trips it
  // unchanged (same as accentColor/fontFamily/baseFontSize), so it's deliberately not validated
  // on this screen's Save.

  return errors;
};

/** Flattens field errors into a plain list, e.g. for a toast summary alongside inline errors. */
export const flattenFieldErrors = (errors: EmailSettingsFieldErrors): string[] => Object.values(errors).filter((value): value is string => Boolean(value));

/** @deprecated Use {@link validateEmailSettingsFields} for inline field errors; kept only for any external caller still expecting a flat list. */
export const validateEmailSettings = (form: EmailSettingsFormValues): string[] => flattenFieldErrors(validateEmailSettingsFields(form));
