import { FIELD_REQUIRED } from '@app/validation/validationMessages';

// This screen edits a fixed set of system templates in place (no add/delete), so it uses plain
// controlled inputs rather than react-hook-form — these are checked directly before Save.
export const validateEmailTemplate = (subject: string, body: string): string | null => {
  if (!subject.trim() || !body.trim()) {
    return FIELD_REQUIRED;
  }
  return null;
};
