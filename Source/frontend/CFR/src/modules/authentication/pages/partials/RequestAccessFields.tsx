import type { ReactNode } from 'react';
import { ArrowRightIcon, CheckIcon } from '@shared/app/components/UiIcons';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';

export function RequestSuccess({ reference }: { reference: string }) {
  return (
    <section className="request-access-success" aria-live="polite">
      <span className="request-access-success__icon"><CheckIcon size={28} /></span>
      <span className="request-access-kicker">Request captured</span>
      <h1>Your organization access request is ready for review.</h1>
      <p>The onboarding team will review your request and follow up using the email you provided.</p>
      <div className="auth-success-reference"><span>Request reference</span><strong>{reference}</strong><small>Keep this reference if you need to follow up on your request.</small></div>
      <PlatformLink to="/login" className="auth-primary-button auth-primary-button--large">Return to sign in <ArrowRightIcon size={16} /></PlatformLink>
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
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'search' | 'url' | 'decimal' | 'none';
}

export function Field({ label, name, type = 'text', placeholder, autoComplete, required, icon, maxLength, error, onErrorClear, format, inputMode }: FieldProps) {
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
