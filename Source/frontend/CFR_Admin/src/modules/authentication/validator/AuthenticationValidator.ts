export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordScore = (value: string): number => [
  value.length >= 8,
  /[A-Z]/.test(value) && /[a-z]/.test(value),
  /[0-9]/.test(value),
  /[^A-Za-z0-9]/.test(value),
].filter(Boolean).length;

export const PASSWORD_STRENGTH_HINT = 'Use at least 8 characters with upper/lowercase letters, a number, and preferably a symbol.';
