// This screen edits a fixed set of system templates in place (no add/delete), so it uses plain
// controlled inputs rather than react-hook-form — these are checked directly before Save.
export const validateEmailTemplate = (subject: string, body: string): string[] => {
  const errors: string[] = [];
  if (!subject.trim()) errors.push('Subject is required.');
  if (!body.trim()) errors.push('Message is required.');
  return errors;
};
