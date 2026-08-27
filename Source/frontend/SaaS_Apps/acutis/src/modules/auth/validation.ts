import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { ApiError } from './api/authApi';

/**
 * Client-side rules for every Acutis auth form — mirrors
 * docs/acutis-auth-spec/validation-standard.md exactly, so the same input is accepted/rejected
 * identically here and on the backend. This is UX only: the backend re-validates everything and
 * is the authoritative source of truth (see that document's "Backend validation is authoritative"
 * rule) — a form bypassed entirely (e.g. a direct API call) is still fully protected server-side.
 */

// Centralized so every required field across every Acutis auth form shows the exact same wording
// — one place to change it, rather than a bespoke "<Field> is required." string per field.
export const REQUIRED_FIELD_MESSAGE = 'This field is required';

// Same shape as ASP.NET Core's [EmailAddress] attribute is willing to accept in practice — not a
// full RFC 5322 implementation, just enough to catch an obviously malformed address client-side.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailRule = {
  required: REQUIRED_FIELD_MESSAGE,
  pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address.' },
};

export const requiredPasswordRule = { required: REQUIRED_FIELD_MESSAGE };

/** Matches CFR.AcutisService.Service.AcutisAuthentication.AcutisAuthValidation exactly. */
export const PASSWORD_POLICY_DESCRIPTION =
  'Password must be at least 8 characters long and include at least one letter and one number.';

export function isPasswordPolicyCompliant(password: string): boolean {
  if (password.length < 8) return false;
  return /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

export const newPasswordPolicyRule = {
  validate: (value: string) => isPasswordPolicyCompliant(value) || PASSWORD_POLICY_DESCRIPTION,
};

/**
 * Maps `ApiError.fieldErrors` (from the backend's `MSResultArgs.errors`, or an equivalent
 * client-side shape from the mock adapter) onto the matching React Hook Form field. Fields the
 * form doesn't recognize are silently ignored rather than crashing — the form-level error banner
 * (driven by `ApiError.message` at the call site) still surfaces the failure either way.
 */
export function applyServerFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  knownFields: readonly FieldPath<TFieldValues>[],
): void {
  if (!(error instanceof ApiError) || error.fieldErrors.length === 0) return;

  for (const fieldError of error.fieldErrors) {
    if ((knownFields as readonly string[]).includes(fieldError.field)) {
      setError(fieldError.field as FieldPath<TFieldValues>, { type: 'server', message: fieldError.message });
    }
  }
}
