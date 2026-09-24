import type { EmailTemplateApiItem, EmailTemplateVariable } from '../types/emailTemplatesTypes';

// Every send path resolves [AccentColor] from the template's own AccentColor field (or the
// built-in default), regardless of template code — a global styling token set on the Email
// Settings page, not message copy, so it's deliberately NOT offered in the "Insert Variable" chip
// row below (inserting it mid-sentence just drops a literal, unresolved-looking placeholder into
// the text). It's still a real, resolved token in the stored HTML (see PasswordReset's inline
// styles), so unsupported-placeholder detection must keep accepting it — see getAllowedTokens.
const ACCENT_COLOR_TOKEN = '[AccentColor]';

// Merge-tag syntax is [Placeholder] to match the backend's SMTPMailService.FormatMailContent,
// which is the same helper every email in this system (including password reset) merges through.
// This list is what the page's "Insert Variable" chip row renders per template.
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
    { token: '[OrganizationName]', label: 'Organization name' },
    { token: '[OrganizationType]', label: 'Organization type' },
    { token: '[OrganizationAddress]', label: 'Organization address' },
    { token: '[RequesterName]', label: 'Requester name' },
    { token: '[RequesterEmail]', label: 'Requester email' },
    { token: '[Phone]', label: 'Phone' },
    { token: '[SubmittedDate]', label: 'Submitted date' },
  ],
  AccessInfo: [
    { token: '[FirstName]', label: 'First name' },
    { token: '[AppName]', label: 'Application name' },
    { token: '[Note]', label: 'Reviewer note' },
  ],
  AccessRequested: [
    { token: '[RequesterName]', label: 'Requester name' },
    { token: '[RequesterEmail]', label: 'Requester email' },
    { token: '[OrganizationName]', label: 'Organization name' },
    { token: '[AppName]', label: 'Application name' },
    { token: '[ReviewLink]', label: 'Admin review link' },
  ],
  ProductRequested: [
    { token: '[ProductName]', label: 'Product name' },
    { token: '[ShortName]', label: 'Short name' },
    { token: '[ProductionUrl]', label: 'Production URL' },
    { token: '[Description]', label: 'Description' },
    { token: '[Features]', label: 'Features' },
    { token: '[RequesterName]', label: 'Requester name' },
    { token: '[RequesterEmail]', label: 'Requester email' },
    { token: '[ReviewLink]', label: 'Admin review link' },
  ],
  ProductRequestApproved: [
    { token: '[FirstName]', label: 'Requester first name' },
    { token: '[RequesterName]', label: 'Requester name' },
    { token: '[ProductName]', label: 'Product name' },
    { token: '[ProductId]', label: 'Product ID' },
    { token: '[ClientId]', label: 'API client ID' },
    { token: '[SecurityKey]', label: 'Security key' },
    { token: '[Remarks]', label: 'Reviewer notes' },
  ],
  ProductRequestRejected: [
    { token: '[FirstName]', label: 'Requester first name' },
    { token: '[RequesterName]', label: 'Requester name' },
    { token: '[ProductName]', label: 'Product name' },
    { token: '[Remarks]', label: 'Reviewer notes' },
  ],
};

// Flags any [Token] in the subject/body that isn't one of this template's known merge tags —
// SMTPMailService.FormatMailContent leaves unknown tokens untouched, so they'd reach the recipient literally.
export const getUnsupportedPlaceholders = (templateCode: string, subject: string, body: string): string[] => {
  const allowed = new Set((EMAIL_TEMPLATE_VARIABLES[templateCode] ?? []).map((variable) => variable.token));
  allowed.add(ACCENT_COLOR_TOKEN);
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
    case 'ProductRequested': return 'New Product Suggestion';
    case 'ProductRequestApproved': return 'Product Suggestion Approved';
    case 'ProductRequestRejected': return 'Product Suggestion Rejected';
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
    case 'ProductRequested': return 'Sent to admins when a visitor suggests a new product.';
    case 'ProductRequestApproved': return 'Sent to the requester when their product suggestion is approved.';
    case 'ProductRequestRejected': return 'Sent to the requester when their product suggestion is rejected.';
    default: return '';
  }
};
