import type { FormEvent, RefObject } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, AlertTriangleIcon } from '@shared/app/components/UiIcons';
import { Brand } from '@shared/app/components/Brand';

interface FieldErrors {
  email?: string;
  password?: string;
}

interface AdminLoginCardProps {
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  onSubmit: (event: FormEvent) => void;
  submitting: boolean;
  formError: string | null;
  fieldErrors: FieldErrors;
  emailRef: RefObject<HTMLInputElement | null>;
  passwordRef: RefObject<HTMLInputElement | null>;
  forgotHref: string;
}

export function AdminLoginCard({
  email, onEmailChange, password, onPasswordChange, showPassword, onToggleShowPassword,
  onSubmit, submitting, formError, fieldErrors,
  emailRef, passwordRef, forgotHref,
}: AdminLoginCardProps) {
  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  return (
    <section className="admin-auth-card">
      <div className="admin-auth-card__header">
        <div className="admin-auth-card__logo">
          <Brand prominent to="/login" local />
        </div>
        <h1 className="admin-auth-card__title">Sign In to CFR Acutis</h1>
      </div>

      <form onSubmit={onSubmit} className="admin-auth-form" noValidate>
        {formError ? (
          <div className="admin-auth-banner" role="alert">
            <AlertTriangleIcon size={15} />
            <span>{formError}</span>
          </div>
        ) : null}

        <div className="admin-auth-field">
          <label className="admin-auth-label" htmlFor="admin-email">Email Address</label>
          <div className="admin-auth-input-wrap">
            <span className="admin-auth-input-icon"><MailIcon size={15} /></span>
            <input
              ref={emailRef}
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              className="admin-auth-input"
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
            />
          </div>
          {fieldErrors.email ? <p id="admin-email-error" className="admin-auth-field-error">{fieldErrors.email}</p> : null}
        </div>

        <div className="admin-auth-field">
          <div className="admin-auth-field__label-row">
            <label className="admin-auth-label" htmlFor="admin-password">Password</label>
            <Link to={forgotHref} className="admin-auth-forgot">Forgot Password?</Link>
          </div>
          <div className="admin-auth-input-wrap">
            <span className="admin-auth-input-icon"><LockIcon size={15} /></span>
            <input
              ref={passwordRef}
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              className="admin-auth-input admin-auth-input--with-action"
              autoComplete="current-password"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'admin-password-error' : undefined}
            />
            <button
              type="button"
              onClick={onToggleShowPassword}
              className="admin-auth-input-action"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          {fieldErrors.password ? <p id="admin-password-error" className="admin-auth-field-error">{fieldErrors.password}</p> : null}
        </div>

        <button type="submit" className="admin-auth-submit" disabled={!canSubmit}>
          {submitting ? (
            <>
              <span className="admin-auth-spinner" aria-hidden="true" />
              Signing In…
            </>
          ) : (
            <>
              Sign In <ArrowRightIcon size={15} />
            </>
          )}
        </button>
      </form>
    </section>
  );
}
