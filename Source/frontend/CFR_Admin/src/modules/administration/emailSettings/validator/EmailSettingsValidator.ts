import type { EmailSettingsFormValues } from '../types/emailSettingsTypes';

// This screen edits a single, always-existing file-backed settings row (no add/delete), so it
// uses plain controlled inputs rather than react-hook-form — checked directly before Save.
export const validateEmailSettings = (form: EmailSettingsFormValues): string[] => {
  const errors: string[] = [];
  if (!form.smtpServer.trim()) errors.push('SMTP server is required.');
  if (!form.username.trim()) errors.push('Username is required.');
  if (form.smtpPort.trim() && (Number(form.smtpPort) <= 0 || Number(form.smtpPort) > 65535)) {
    errors.push('SMTP port must be between 1 and 65535.');
  }
  if (form.baseFontSize.trim() && (Number(form.baseFontSize) < 10 || Number(form.baseFontSize) > 24)) {
    errors.push('Base font size must be between 10 and 24.');
  }
  return errors;
};
