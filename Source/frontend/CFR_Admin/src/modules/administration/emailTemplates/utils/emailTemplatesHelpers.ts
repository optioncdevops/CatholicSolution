import type { EmailTemplateApiItem, EmailTemplateVariable } from '../types/emailTemplatesTypes';

// Every send path resolves [AccentColor] from the template's own AccentColor field (or the
// built-in default), regardless of template code, so it's available to insert everywhere.
const ACCENT_COLOR_VARIABLE: EmailTemplateVariable = { token: '[AccentColor]', label: 'Accent color' };

// Merge-tag syntax is [Placeholder] to match the backend's SMTPMailService.FormatMailContent,
// which is the same helper every email in this system (including password reset) merges through.
export const EMAIL_TEMPLATE_VARIABLES: Record<string, EmailTemplateVariable[]> = {
  PasswordReset: [
    { token: '[FirstName]', label: 'First name' },
    { token: '[ResetLink]', label: 'Reset link' },
    { token: '[ExpiryMinutes]', label: 'Link expiry (minutes)' },
    ACCENT_COLOR_VARIABLE,
  ],
  Welcome: [{ token: '[FirstName]', label: 'First name' }, ACCENT_COLOR_VARIABLE],
  AccessApproved: [
    { token: '[FirstName]', label: 'First name' },
    { token: '[AppName]', label: 'Application name' },
    ACCENT_COLOR_VARIABLE,
  ],
  AccessInfo: [
    { token: '[FirstName]', label: 'First name' },
    { token: '[AppName]', label: 'Application name' },
    { token: '[Note]', label: 'Reviewer note' },
    ACCENT_COLOR_VARIABLE,
  ],
  AccessRequested: [
    { token: '[RequesterName]', label: 'Requester name' },
    { token: '[RequesterEmail]', label: 'Requester email' },
    { token: '[OrganizationName]', label: 'Organization name' },
    { token: '[AppName]', label: 'Application name' },
    { token: '[ReviewLink]', label: 'Admin review link' },
    ACCENT_COLOR_VARIABLE,
  ],
};

// Flags any [Token] in the subject/body that isn't one of this template's known merge tags —
// SMTPMailService.FormatMailContent leaves unknown tokens untouched, so they'd reach the recipient literally.
export const getUnsupportedPlaceholders = (templateCode: string, subject: string, body: string): string[] => {
  const allowed = new Set((EMAIL_TEMPLATE_VARIABLES[templateCode] ?? []).map((variable) => variable.token));
  const found = new Set<string>();
  for (const text of [subject, body]) {
    for (const match of text.match(/\[\w+\]/g) ?? []) {
      if (!allowed.has(match)) found.add(match);
    }
  }
  return Array.from(found);
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
    case 'AccessRequested': return 'New Access Request';
    default: return templateCode;
  }
};

export const templateDescription = (templateCode: string): string => {
  switch (templateCode) {
    case 'PasswordReset': return 'Sent when a user requests a password reset link.';
    case 'Welcome': return 'Sent when a new account is provisioned.';
    case 'AccessApproved': return 'Sent when an access request is approved.';
    case 'AccessInfo': return 'Sent when a reviewer requests more detail on a request.';
    case 'AccessRequested': return 'Sent to admins when a member submits an access request.';
    default: return '';
  }
};
