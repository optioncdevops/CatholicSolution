import type { FormEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, AlertTriangleIcon } from '@shared/app/components/UiIcons';
import { Brand } from '@shared/app/components/Brand';

interface AdminLoginCardProps {
  emailRegister: UseFormRegisterReturn<'email'>;
  passwordRegister: UseFormRegisterReturn<'password'>;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  canSubmit: boolean;
  formError: string | null;
  emailError?: string;
  passwordError?: string;
  forgotHref: string;
}

export function AdminLoginCard({
  emailRegister, passwordRegister, showPassword, onToggleShowPassword,
  onSubmit, submitting, canSubmit, formError, emailError, passwordError, forgotHref,
}: AdminLoginCardProps) {
  return (
    <section className="admin-auth-card">
      <div className="admin-auth-card__header">
        <div className="admin-auth-card__logo">
          <Brand prominent to="/login" local />
        </div>
        <h1 className="admin-auth-card__title">Sign In to CFR Acutis</h1>
      </div>

      <form id="formSignIn" onSubmit={onSubmit} className="admin-auth-form" noValidate>
        {formError ? (
          <div className="admin-auth-banner" role="alert">
            <AlertTriangleIcon size={15} />
            <span>{formError}</span>
          </div>
        ) : null}

        <div className="admin-auth-field">
          <label className="admin-auth-label" htmlFor="txtEmailAddress">Email Address</label>
          <div className="admin-auth-input-wrap">
            <span className="admin-auth-input-icon"><MailIcon size={15} /></span>
            <input
              id="txtEmailAddress"
              type="email"
              className="admin-auth-input"
              autoComplete="email"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'txtEmailAddress-error' : undefined}
              {...emailRegister}
            />
          </div>
          {emailError ? <p id="txtEmailAddress-error" className="admin-auth-field-error">{emailError}</p> : null}
        </div>

        <div className="admin-auth-field">
          <label className="admin-auth-label" htmlFor="txtPassword">Password</label>
          <div className="admin-auth-input-wrap">
            <span className="admin-auth-input-icon"><LockIcon size={15} /></span>
            <input
              id="txtPassword"
              type={showPassword ? 'text' : 'password'}
              className="admin-auth-input admin-auth-input--with-action"
              autoComplete="current-password"
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? 'txtPassword-error' : undefined}
              {...passwordRegister}
            />
            <button
              id="ibtnTogglePasswordVisibility"
              type="button"
              onClick={onToggleShowPassword}
              className="admin-auth-input-action"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          {passwordError ? <p id="txtPassword-error" className="admin-auth-field-error">{passwordError}</p> : null}
        </div>

        <button id="btnSignIn" type="submit" className="admin-auth-submit" disabled={!canSubmit}>
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

        {/* Deliberately placed after the Sign In button in DOM/tab order (email -> password ->
            show/hide toggle -> Sign In -> Forgot Password) rather than between the fields, where
            it used to sit ahead of the password input in tab order. */}
        <Link id="lnkForgotPassword" to={forgotHref} className="admin-auth-forgot admin-auth-forgot--below">Forgot Password?</Link>
      </form>
    </section>
  );
}
