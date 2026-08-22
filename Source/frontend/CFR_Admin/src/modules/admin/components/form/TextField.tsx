import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { CONTROL_BASE, CONTROL_HEIGHT, CONTROL_INVALID, FIELD_ERROR, FIELD_LABEL } from './controlStyles';

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
}

type TextFieldProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode };

export function TextField({ label, error, hint, className = '', icon, id, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;
  const hintId = hint ? `${fieldId}-hint` : undefined;

  return (
    <label htmlFor={fieldId} className={`flex flex-col gap-1 ${FIELD_LABEL} ${className}`}>
      {label}
      <span className="relative flex items-center">
        {icon ? <span className="pointer-events-none absolute left-2.5 grid place-items-center text-[var(--text-faint)]">{icon}</span> : null}
        <input
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          className={`${CONTROL_BASE} ${CONTROL_HEIGHT} ${CONTROL_INVALID} ${icon ? 'pl-8' : ''}`}
          {...inputProps}
        />
      </span>
      {hint && !error ? <span id={hintId} className="text-[length:var(--admin-text-2xs)] text-[var(--text-faint)]">{hint}</span> : null}
      {error ? <span id={errorId} className={FIELD_ERROR}>{error}</span> : null}
    </label>
  );
}

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
