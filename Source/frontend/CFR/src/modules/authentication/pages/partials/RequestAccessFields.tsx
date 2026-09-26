import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowRightIcon, CheckIcon, ChevronDownIcon, SearchIcon } from '@shared/app/components/UiIcons';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';

interface RequestSuccessProps {
  /** CS-{year}-REQ-{id} - see formatRequestReference. */
  reference: string;
  /** The email the requester entered; the team follows up there. */
  emailAddress: string;
  title?: string;
  /** Sentence text that comes right before the requester's email ("...contact you at {email} with the next steps."). */
  description?: string;
  pendingNote?: string;
}

/** Confirmation shown after submitting the Request Access or Product Request form. */
export function RequestSuccess({
  reference,
  emailAddress,
  title = 'Your Organization And Product Request Have Been Submitted',
  description,
  pendingNote = 'Product access is pending review.',
}: RequestSuccessProps) {
  const email = emailAddress || 'the email address you provided';
  return (
    <section className="request-access-success" aria-live="polite">
      <span className="request-access-success__icon"><CheckIcon size={28} /></span>
      <span className="request-access-kicker">Request submitted</span>
      <h1>{title}</h1>
      <p>
        {description ?? 'We’ve received your organization details and request for product access. Our team will review the information and contact you at '}
        <strong>{email}</strong> with the next steps.
      </p>
      <div className="auth-success-reference">
        <span>Request Reference</span>
        <strong>{reference}</strong>
        <small>Keep this reference if you need to follow up. {pendingNote}</small>
      </div>
      <PlatformLink to="/login" className="auth-primary-button auth-primary-button--large">Return To Sign In <ArrowRightIcon size={16} /></PlatformLink>
    </section>
  );
}

export function AccessSection({ number, title, subtitle, children }: { number?: string; title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className={`request-access-section request-access-section--full${title ? '' : ' request-access-section--no-heading'}`}>
      {title ? (
        <div className="request-access-section__heading">
          <span>{number}</span>
          <div>
            <h3>{title}</h3>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      <div className="request-access-section__body">{children}</div>
    </section>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  icon?: ReactNode;
  maxLength?: number;
  error?: string;
  onErrorClear?: () => void;
  format?: (value: string) => string;
  inputMode?:    'text' | 'numeric' | 'tel' | 'email' | 'search' | 'url' | 'decimal' | 'none';
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export function Field({ label, name, type = 'text', placeholder, autoComplete, required, icon, maxLength, error, onErrorClear, format, inputMode, onBlur }: FieldProps) {
  return (
    <div>
      <label className="auth-label" htmlFor={name}>{label}{required && <span className="ml-1 text-rose-600">*</span>}</label>
      <div className="auth-input-wrap mt-2">
        {icon ? <span className="auth-input-icon">{icon}</span> : null}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          maxLength={maxLength}
          inputMode={inputMode}
          className={`auth-input ${icon ? '' : 'auth-input--plain'}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          onChange={(event) => {
            if (format) event.target.value = format(event.target.value);
            onErrorClear?.();
          }}
          onBlur={onBlur}
        />
      </div>
      {error ? <p id={`${name}-error`} className="auth-field-error !text-red-600">{error}</p> : null}
    </div>
  );
}

type SelectOption = string | { value: string; label: string };

export function SelectField({ label, name, options, required, placeholder, error, onErrorClear }: { label: string; name: string; options: readonly SelectOption[]; required?: boolean; placeholder?: string; error?: string; onErrorClear?: () => void }) {
  return (
    <div>
      <label className="auth-label" htmlFor={name}>{label}{required && <span className="ml-1 text-rose-600">*</span>}</label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue=""
        className="auth-input auth-input--plain mt-2"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={onErrorClear}
      >
        <option value="" disabled>{placeholder ?? 'Select'}</option>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          return <option key={value} value={value}>{optionLabel}</option>;
        })}
      </select>
      {error ? <p id={`${name}-error`} className="auth-field-error !text-red-600">{error}</p> : null}
    </div>
  );
}

interface SearchableSelectFieldProps {
  label: string;
  name: string;
  options: readonly { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  error?: string;
  onErrorClear?: () => void;
}

/** Dropdown with a type-to-filter search box. Submits its value through a hidden input named `name`. */
export function SearchableSelectField({ label, name, options, required, placeholder, error, onErrorClear }: SearchableSelectFieldProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [value, setValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? options.filter((option) => option.label.toLowerCase().includes(term)) : options;
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const openList = () => {
    setQuery('');
    setActiveIndex(0);
    setOpen(true);
  };

  const choose = (optionValue: string) => {
    setValue(optionValue);
    setOpen(false);
    onErrorClear?.();
  };

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (filtered[activeIndex]) choose(filtered[activeIndex].value);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <label className="auth-label" htmlFor={name}>{label}{required && <span className="ml-1 text-rose-600">*</span>}</label>
      <input type="hidden" name={name} value={value} />
      <button
        id={name}
        type="button"
        className="auth-input auth-input--plain mt-2 flex items-center justify-between text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
      >
        <span className="truncate">{selected ? selected.label : (placeholder ?? 'Select')}</span>
        <ChevronDownIcon size={16} />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="relative border-b border-slate-100 p-2">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon size={14} /></span>
            <input
              ref={searchRef}
              type="text"
              value={query}
              placeholder="Search..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2 text-xs text-black outline-none focus:border-[#12264c]"
              onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
              onKeyDown={onSearchKeyDown}
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-slate-400">No matches found</li>
            ) : filtered.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={`cursor-pointer px-3 py-2 text-xs text-black ${index === activeIndex ? 'bg-slate-100' : ''} ${option.value === value ? 'font-bold' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {error ? <p id={`${name}-error`} className="auth-field-error !text-red-600">{error}</p> : null}
    </div>
  );
}
