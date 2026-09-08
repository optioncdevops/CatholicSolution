import type { InputHTMLAttributes } from 'react';
import { EyeIcon, EyeOffIcon, LockIcon } from './UiIcons';

/**
 * Shared password input + show/hide toggle, used by the auth-flow password screens
 * (shared/auth/ResetPasswordPage). Accepts native input props (spread react-hook-form's
 * `register(...)` result directly) rather than controlled value/onChange, so the eye-icon
 * show/hide behavior stays identical wherever a password field is validated with RHF.
 */
interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  id: string;
  label: string;
  visible: boolean;
  onToggle: () => void;
  error?: string;
  leadingIcon?: boolean;
  labelClassName?: string;
  wrapClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  actionClassName?: string;
}

export function PasswordField({
  id,
  label,
  visible,
  onToggle,
  error,
  disabled,
  leadingIcon = true,
  labelClassName = 'admin-auth-label',
  wrapClassName = 'admin-auth-input-wrap',
  inputClassName = 'admin-auth-input admin-auth-input--with-action',
  iconClassName = 'admin-auth-input-icon',
  actionClassName = 'admin-auth-input-action',
  ...inputProps
}: PasswordFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <>
      <label className={labelClassName} htmlFor={id}>{label}</label>
      <div className={wrapClassName}>
        {leadingIcon ? <span className={iconClassName}><LockIcon size={15} /></span> : null}
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={inputClassName}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          {...inputProps}
        />
        <button
          id={`ibtnToggle${id.charAt(0).toUpperCase()}${id.slice(1)}Visibility`}
          type="button"
          className={actionClassName}
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          disabled={disabled}
        >
          {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        </button>
      </div>
      {error ? <p id={errorId} className="admin-auth-field-error">{error}</p> : null}
    </>
  );
}
