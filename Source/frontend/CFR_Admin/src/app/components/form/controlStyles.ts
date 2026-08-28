/**
 * Shared Tailwind class fragments for form controls, built on the theme tokens in
 * `modules/theme.css`. Centralized here so every control (input, select, textarea)
 * stays visually consistent without repeating the same arbitrary-value classes everywhere.
 */
export const CONTROL_BASE =
  'w-full rounded-[var(--admin-control-radius)] border border-[var(--line)] bg-[var(--surface)] ' +
  'px-[var(--admin-control-padding-x)] text-[length:var(--admin-text-base)] [font-weight:var(--admin-weight-regular)] ' +
  'text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-faint)] ' +
  'focus:border-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60';

export const CONTROL_HEIGHT = 'min-h-[var(--admin-control-height)]';

export const CONTROL_INVALID = 'aria-[invalid=true]:border-[var(--error)] aria-[invalid=true]:focus:border-[var(--error)]';

export const FIELD_LABEL =
  'text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-bold)] text-[var(--text-secondary)] capitalize';

export const FIELD_ERROR =
  'text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-medium)] text-[var(--error)]';
