import type { FormEvent, RefObject } from 'react';
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, AlertTriangleIcon } from '@shared/app/components/UiIcons';
import { Brand } from '@shared/app/components/Brand';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';

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
  remember: boolean;
  onRememberChange: (value: boolean) => void;
  onSubmit: (event: FormEvent) => void;
  submitting: boolean;
  formError: string | null;
  fieldErrors: FieldErrors;
  emailRef: RefObject<HTMLInputElement | null>;
  passwordRef: RefObject<HTMLInputElement | null>;
  forgotHref: string;
  showDemoHint: boolean;
}

export function AdminLoginCard({
  email, onEmailChange, password, onPasswordChange, showPassword, onToggleShowPassword,
  remember, onRememberChange, onSubmit, submitting, formError, fieldErrors,
  emailRef, passwordRef, forgotHref, showDemoHint,
}: AdminLoginCardProps) {
  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  return (
    <section className="admin-auth-card">
      <div className="admin-auth-card__header">
        <div className="admin-auth-card__logo">
          <Brand compact to="/login" local />
        </div>
        <h1 className="admin-auth-card__title">Sign in to CFR Admin</h1>
      </div>

      <form onSubmit={onSubmit} className="admin-auth-form" noValidate>
        {formError ? (
          <div className="admin-auth-banner" role="alert">
            <AlertTriangleIcon size={15} />
            <span>{formError}</span>
          </div>
        ) : null}

        <div className="admin-auth-field">
          <label className="admin-auth-label" htmlFor="admin-email">Email address</label>
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
            <PlatformLink to={forgotHref} className="admin-auth-forgot">Forgot password?</PlatformLink>
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

        <div className="admin-auth-checkbox-row">
          <label className="admin-auth-checkbox">
            <input type="checkbox" checked={remember} onChange={(event) => onRememberChange(event.target.checked)} />
            Keep me signed in
          </label>
        </div>

        <button type="submit" className="admin-auth-submit" disabled={!canSubmit}>
          {submitting ? (
            <>
              <span className="admin-auth-spinner" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRightIcon size={15} />
            </>
          )}
        </button>

        {showDemoHint ? (
          <p className="admin-auth-hint">Prototype credentials: carl.lapp@optionc.com / demo1234</p>
        ) : null}
      </form>
    </section>
  );
}
