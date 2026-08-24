import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { CONTROL_BASE, CONTROL_INVALID, FIELD_ERROR, FIELD_LABEL } from './controlStyles';

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
}

/**
 * The only surviving export of this pre-port field library — kept because it forwards a ref
 * to the underlying <textarea>, which the ported formControls `TextareaField` doesn't support,
 * and `EmailTemplatesPage` needs that ref for cursor-position merge-tag insertion.
 */
type TextareaFieldProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
  { label, error, hint, className = '', id, rows = 3, ...textareaProps },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <label htmlFor={fieldId} className={`flex flex-col gap-1 ${FIELD_LABEL} ${className}`}>
      {label}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`${CONTROL_BASE} ${CONTROL_INVALID} py-2 leading-6`}
        {...textareaProps}
      />
      {hint && !error ? <span className="text-[length:var(--admin-text-2xs)] text-[var(--text-faint)]">{hint}</span> : null}
      {error ? <span id={errorId} className={FIELD_ERROR}>{error}</span> : null}
    </label>
  );
});
