import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { CONTROL_BASE, CONTROL_HEIGHT, FIELD_LABEL } from './controlStyles';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hideLabel?: boolean;
  children: ReactNode;
}

/** Standalone labelled select used in forms. For compact filter bars, use `FilterSelect`. */
export function SelectField({ label, hideLabel = false, id, children, className = '', ...selectProps }: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <label htmlFor={fieldId} className={`flex flex-col gap-1 ${FIELD_LABEL} ${className}`}>
      <span className={hideLabel ? 'sr-only' : undefined}>{label}</span>
      <span className="relative flex items-center">
        <select id={fieldId} className={`${CONTROL_BASE} ${CONTROL_HEIGHT} appearance-none pr-8`} {...selectProps}>
          {children}
        </select>
        <ChevronDownIcon size={14} className="pointer-events-none absolute right-2.5 text-[var(--text-faint)]" />
      </span>
    </label>
  );
}

/** Compact select for filter toolbars — smaller footprint, label is visually hidden but announced. */
export function FilterSelect({ label, id, children, ...selectProps }: Omit<SelectFieldProps, 'hideLabel' | 'className'>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <label htmlFor={fieldId} className="relative flex items-center">
      <span className="sr-only">{label}</span>
      <select
        id={fieldId}
        className="h-8 appearance-none rounded-[var(--admin-control-radius)] border border-[var(--line)] bg-[var(--surface)] py-0 pl-2.5 pr-7 text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-bold)] text-[var(--text-secondary)] outline-none focus:border-[var(--secondary)]"
        {...selectProps}
      >
        {children}
      </select>
      <ChevronDownIcon size={12} className="pointer-events-none absolute right-2 text-[var(--text-faint)]" />
    </label>
  );
}
