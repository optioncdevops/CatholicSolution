import type { LoginFormValues, ResetPasswordFormValues } from '../types/authenticationTypes';

export const loginDefaultValues: LoginFormValues = {
  email: '',
  password: '',
  remember: true,
};

export const resetPasswordDefaultValues: ResetPasswordFormValues = {
  code: '',
  password: '',
  confirmPassword: '',
};

export type LoginFieldErrors = { email?: string; password?: string };

export function validateLoginFields(email: string, password: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  if (!email.trim()) errors.email = 'Email address is required.';
  if (!password) errors.password = 'Password is required.';
  return errors;
}

export function validateLoginCredentials(email: string, password: string): string[] {
  return Object.values(validateLoginFields(email, password));
}

export function passwordScore(value: string) {
  return [
    value.length >= 8,
    /[A-Z]/.test(value) && /[a-z]/.test(value),
    /[0-9]/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ].filter(Boolean).length;
}

export function validateResetPassword(code: string, password: string, confirmPassword: string): string[] {
  const messages: string[] = [];
  if (code.trim().length < 6) messages.push('Enter the 6-digit verification code from your recovery email.');
  if (passwordScore(password) < 3) {
    messages.push('Use at least 8 characters with upper/lowercase letters, a number, and preferably a symbol.');
  }
  if (password !== confirmPassword) messages.push('The new passwords do not match.');
  return messages;
}
