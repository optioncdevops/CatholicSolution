import type { EmailSettingsFormValues } from '../types/emailSettingsTypes';

// Same shape as the Users module's UsersValidator.ts eMail pattern — one email-format rule
// reused everywhere a plain email address is accepted in this app.
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const LOOPBACK_OR_PRIVATE_HOST = /^https?:\/\/(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)([:/]|$)/i;

export type EmailSettingsFieldErrors = Partial<Record<keyof EmailSettingsFormValues, string>>;

/** True when the value is a syntactically well-formed absolute http(s) URL. */
const isValidAbsoluteUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

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

  const apiBaseUrl = form.apiBaseUrl.trim();
  if (apiBaseUrl) {
    if (!isValidAbsoluteUrl(apiBaseUrl)) {
      errors.apiBaseUrl = 'Enter a valid absolute URL, e.g. https://api.example.com.';
    } else if (!/^https:\/\//i.test(apiBaseUrl)) {
      errors.apiBaseUrl = 'API base URL must start with https:// so recipients’ email clients can load the logo securely.';
    } else if (LOOPBACK_OR_PRIVATE_HOST.test(apiBaseUrl)) {
      // This URL is embedded as an <img src> in real outgoing emails — a localhost/private-
      // network address only the machine sending the email can reach produces a permanently
      // broken logo for every recipient. Block it here rather than let it reach a live send.
      errors.apiBaseUrl = 'API base URL cannot be a localhost or private-network address — recipients’ email clients cannot reach it. Use the public address of this API.';
    }
  }

  return errors;
};

/** Flattens field errors into a plain list, e.g. for a toast summary alongside inline errors. */
export const flattenFieldErrors = (errors: EmailSettingsFieldErrors): string[] => Object.values(errors).filter((value): value is string => Boolean(value));

/** @deprecated Use {@link validateEmailSettingsFields} for inline field errors; kept only for any external caller still expecting a flat list. */
export const validateEmailSettings = (form: EmailSettingsFormValues): string[] => flattenFieldErrors(validateEmailSettingsFields(form));
