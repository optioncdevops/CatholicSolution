import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, MailIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';
import { AdminAuthShell } from './AdminAuthShell';
import { forgotPassword } from './services/authService';
import { EMAIL_PATTERN } from './validators';

interface ForgotPasswordFormValues {
  email: string;
}

// /forgot-password is only ever reached by an in-app link from /login (never a direct external
// landing target), and none of client_id/entry/returnUrl affect anything on this page itself — so
// unlike /reset-password (which genuinely arrives via an external emailed link), there's nothing
// worth carrying forward here. "Back to Sign In" goes to plain /login rather than forwarding
// whatever query string this page happened to be reached with.
const LOGIN_TARGET = '/login';

export function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const submit = handleSubmit(async (values) => {
    const trimmedEmail = values.email.trim();
    setServerError('');
    setSubmitting(true);
    try {
      const { statusMessage, resultData } = await forgotPassword({ userName: trimmedEmail });
      // The backend flags resultData.alreadyRequested when a previously issued link for this
      // account is still active — nothing new was sent, so this is informational, not a fresh
      // "email sent" success; it gets its own message and toast tone rather than the green
      // success banner implying a brand new email just went out.
      const alreadyRequested = Boolean((resultData as { alreadyRequested?: boolean } | null | undefined)?.alreadyRequested);
      showToast(statusMessage || 'Password reset instructions sent.', alreadyRequested ? 'info' : 'success');
      setSubmittedEmail(trimmedEmail);
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Something went wrong. Please try again.';
      setServerError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  });

  const fieldError = errors.email?.message ?? serverError;

  return (
    <AdminAuthShell>
      <section className="admin-auth-card">
        {submittedEmail ? (
          <div className="admin-auth-success" aria-live="polite">
            <span className="admin-auth-success__icon"><CheckIcon size={22} /></span>
            <span className="admin-auth-card__kicker">Recovery Requested</span>
            <h2>Check Your Email</h2>
            <p>A secure password reset link has been sent to <strong>{submittedEmail}</strong>. For your security, the link will expire after a limited time and can only be used once.</p>
            <div className="admin-auth-success__actions">
              <Link to={LOGIN_TARGET} className="admin-auth-submit admin-auth-submit--link">
                Return to Sign In <ArrowRightIcon size={15} />
              </Link>
              <button type="button" className="admin-auth-submit admin-auth-submit--link admin-auth-submit--ghost" onClick={() => setSubmittedEmail('')}>
                Use a Different Email
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link to={LOGIN_TARGET} className="admin-auth-back-link"><ArrowLeftIcon size={13} /> Back To Sign In</Link>
            <div className="admin-auth-card__header">
              <span className="admin-auth-card__mark"><ShieldCheckIcon size={20} /></span>
              <span className="admin-auth-card__kicker">Account Recovery</span>
              <h1 className="admin-auth-card__title">Forgot Your Password?</h1>
              <p className="admin-auth-card__description">Enter the email address associated with your account. We&apos;ll send you a link to reset your password.</p>
            </div>
            <form id="formForgotPassword" onSubmit={submit} className="admin-auth-form" noValidate>
              <div className="admin-auth-field">
                <label className="admin-auth-label" htmlFor="txtEmailAddress">Email Address</label>
                <div className="admin-auth-input-wrap">
                  <span className="admin-auth-input-icon"><MailIcon size={15} /></span>
                  <input
                    id="txtEmailAddress"
                    type="email"
                    className="admin-auth-input"
                    autoComplete="email"
                    placeholder="name@organization.org"
                    autoFocus
                    disabled={submitting}
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby={fieldError ? 'txtEmailAddress-error' : undefined}
                    {...register('email', {
                      required: 'Enter the email connected to your account.',
                      pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address.' },
                    })}
                  />
                </div>
              </div>

              {fieldError ? (
                <div id="txtEmailAddress-error" className="admin-auth-banner" role="alert">
                  <AlertTriangleIcon size={15} />
                  <span>{fieldError}</span>
                </div>
              ) : null}

              <button id="btnSendResetLink" type="submit" className="admin-auth-submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="admin-auth-spinner" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send Reset Link <ArrowRightIcon size={15} />
                  </>
                )}
              </button>
            </form>
            <div className="admin-auth-security-note"><ShieldCheckIcon size={14} /><span>For security, password reset links expire after a limited time.</span></div>
          </>
        )}
      </section>
    </AdminAuthShell>
  );
}
