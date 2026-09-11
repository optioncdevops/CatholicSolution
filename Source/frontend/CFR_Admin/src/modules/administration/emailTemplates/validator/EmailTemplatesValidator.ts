// This screen edits a fixed set of system templates in place (no add/delete), so it uses plain
// controlled inputs rather than react-hook-form — these are checked directly before Save.
// SUBJECT_MAX_LENGTH matches [adm].[EmailTemplate].[Subject] NVARCHAR(200) — kept in sync with
// EmailTemplatesService.SaveEmailTemplateAsync's server-side check.
export const SUBJECT_MAX_LENGTH = 200;

// Kept in sync with EmailTemplatesService.SaveEmailTemplateAsync's MinimumLinkExpiryMinutes /
// MaximumLinkExpiryMinutes server-side check.
export const MIN_LINK_EXPIRY_MINUTES = 5;
export const MAX_LINK_EXPIRY_MINUTES = 1440;

export const validateEmailTemplate = (subject: string, body: string, linkExpiryMinutes?: string): string[] => {
  const errors: string[] = [];
  if (!subject.trim()) errors.push('Subject is required.');
  if (subject.length > SUBJECT_MAX_LENGTH) errors.push(`Subject must be ${SUBJECT_MAX_LENGTH} characters or fewer.`);
  if (!body.trim()) errors.push('Message is required.');
  if (linkExpiryMinutes !== undefined && linkExpiryMinutes.trim()) {
    const parsed = Number(linkExpiryMinutes);
    if (!Number.isInteger(parsed) || parsed < MIN_LINK_EXPIRY_MINUTES || parsed > MAX_LINK_EXPIRY_MINUTES) {
      errors.push(`Link expiry must be a whole number between ${MIN_LINK_EXPIRY_MINUTES} and ${MAX_LINK_EXPIRY_MINUTES} minutes.`);
    }
  }
  return errors;
};
