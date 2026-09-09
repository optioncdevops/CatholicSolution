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
  // This URL is embedded as an <img src> in real outgoing emails — a localhost/private-network
  // address only the machine sending the email can reach produces a permanently broken logo for
  // every recipient. Block it here rather than let it reach a live send.
  const apiBaseUrl = form.apiBaseUrl.trim().toLowerCase();
  if (apiBaseUrl && /^https?:\/\/(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)([:/]|$)/.test(apiBaseUrl)) {
    errors.push('API base URL cannot be a localhost or private-network address — recipients’ email clients cannot reach it. Use the public address of this API.');
  }
  return errors;
};
