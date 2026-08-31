import type { EmailTemplateApiItem, EmailTemplateVariable } from '../types/emailTemplatesTypes';

// Merge-tag syntax is [Placeholder] to match the backend's SMTPMailService.FormatMailContent,
// which is the same helper every email in this system (including password reset) merges through.
export const EMAIL_TEMPLATE_VARIABLES: Record<string, EmailTemplateVariable[]> = {
  PasswordReset: [
    { token: '[FirstName]', label: 'First name' },
    { token: '[ResetLink]', label: 'Reset link' },
    { token: '[ExpiryMinutes]', label: 'Link expiry (minutes)' },
  ],
  Welcome: [{ token: '[FirstName]', label: 'First name' }],
  AccessApproved: [
    { token: '[FirstName]', label: 'First name' },
    { token: '[AppName]', label: 'Application name' },
  ],
  AccessInfo: [
    { token: '[FirstName]', label: 'First name' },
    { token: '[AppName]', label: 'Application name' },
    { token: '[Note]', label: 'Reviewer note' },
  ],
};

// Mirrors backend EmailTemplateSampleData.ForTemplateCode — keep both in sync so the live
// preview shown here matches what "Send Test" actually merges and sends server-side.
const SAMPLE_VALUES: Record<string, Record<string, string>> = {
  PasswordReset: { FirstName: 'Jordan', ResetLink: 'https://example.org/reset-password?token=sample-token', ExpiryMinutes: '30' },
  Welcome: { FirstName: 'Jordan' },
  AccessApproved: { FirstName: 'Jordan', AppName: 'Matt Money' },
  AccessInfo: { FirstName: 'Jordan', AppName: 'Matt Money', Note: 'Please confirm your role at the organization before we can proceed.' },
};

export const renderSample = (templateCode: string, text: string): string => {
  const values = SAMPLE_VALUES[templateCode] ?? {};
  return text.replace(/\[(\w+)\]/g, (match, key: string) => values[key] ?? match);
};

export const normalizeEmailTemplatesList = (resultData: unknown): EmailTemplateApiItem[] => {
  if (!Array.isArray(resultData)) return [];
  return resultData as EmailTemplateApiItem[];
};

export const templateDisplayLabel = (templateCode: string): string => {
  switch (templateCode) {
    case 'PasswordReset': return 'Password Reset';
    case 'Welcome': return 'Welcome Email';
    case 'AccessApproved': return 'Access Approved';
    case 'AccessInfo': return 'More Information Needed';
    default: return templateCode;
  }
};

export const templateDescription = (templateCode: string): string => {
  switch (templateCode) {
    case 'PasswordReset': return 'Sent when a user requests a password reset link.';
    case 'Welcome': return 'Sent when a new account is provisioned.';
    case 'AccessApproved': return 'Sent when an access request is approved.';
    case 'AccessInfo': return 'Sent when a reviewer requests more detail on a request.';
    default: return '';
  }
};
