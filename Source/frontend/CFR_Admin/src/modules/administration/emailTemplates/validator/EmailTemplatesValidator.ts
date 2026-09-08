// This screen edits a fixed set of system templates in place (no add/delete), so it uses plain
// controlled inputs rather than react-hook-form — these are checked directly before Save.
// SUBJECT_MAX_LENGTH matches [adm].[EmailTemplate].[Subject] NVARCHAR(200) — kept in sync with
// EmailTemplatesService.SaveEmailTemplateAsync's server-side check.
export const SUBJECT_MAX_LENGTH = 200;

export const validateEmailTemplate = (subject: string, body: string): string[] => {
  const errors: string[] = [];
  if (!subject.trim()) errors.push('Subject is required.');
  if (subject.length > SUBJECT_MAX_LENGTH) errors.push(`Subject must be ${SUBJECT_MAX_LENGTH} characters or fewer.`);
  if (!body.trim()) errors.push('Message is required.');
  return errors;
};
