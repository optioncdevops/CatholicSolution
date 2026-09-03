import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AlertTriangleIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, MailIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';
import { AdminAuthShell } from './AdminAuthShell';
import { forgotPassword } from './services/authService';
import { EMAIL_PATTERN } from './validators';

interface ForgotPasswordFormValues {
  email: string;
}

export function ForgotPasswordPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email')?.trim() ?? '';
  const { showToast } = useToast();
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const loginTarget = useMemo(() => `/login${location.search}`, [location.search]);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: initialEmail },
    mode: 'onChange',
  });

  const submit = handleSubmit(async (values) => {
    const trimmedEmail = values.email.trim();
    setServerError('');
    setSubmitting(true);
    try {
      await forgotPassword({ userName: trimmedEmail });
      showToast('Password reset instructions sent.', 'success');
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
            <p>We&apos;ve sent a secure password reset link to <strong>{submittedEmail}</strong>. It expires after a short period and can only be used once.</p>
            <div className="admin-auth-success__actions">
              <Link to={loginTarget} className="admin-auth-submit admin-auth-submit--link">
                Return to Sign In <ArrowRightIcon size={15} />
              </Link>
              <button type="button" className="admin-auth-submit admin-auth-submit--link admin-auth-submit--ghost" onClick={() => setSubmittedEmail('')}>
                Use a Different Email
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link to={loginTarget} className="admin-auth-back-link"><ArrowLeftIcon size={13} /> Back To Sign In</Link>
            <div className="admin-auth-card__header">
              <span className="admin-auth-card__mark"><ShieldCheckIcon size={20} /></span>
              <span className="admin-auth-card__kicker">Account Recovery</span>
              <h1 className="admin-auth-card__title">Forgot Your Password?</h1>
              <p className="admin-auth-card__description">Enter The Email Address Associated With Your Account. We&apos;ll Send You A Link To Reset Your Password.</p>
            </div>
            <form onSubmit={submit} className="admin-auth-form" noValidate>
              <div className="admin-auth-field">
                <label className="admin-auth-label" htmlFor="reset-email">Email Address</label>
                <div className="admin-auth-input-wrap">
                  <span className="admin-auth-input-icon"><MailIcon size={15} /></span>
                  <input
                    id="reset-email"
                    type="email"
                    className="admin-auth-input"
                    autoComplete="email"
                    placeholder="name@organization.org"
                    autoFocus
                    disabled={submitting}
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby={fieldError ? 'reset-email-error' : undefined}
                    {...register('email', {
                      required: 'Enter the email connected to your account.',
                      pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address.' },
                    })}
                  />
                </div>
              </div>

              {fieldError ? (
                <div id="reset-email-error" className="admin-auth-banner" role="alert">
                  <AlertTriangleIcon size={15} />
                  <span>{fieldError}</span>
                </div>
              ) : null}

              <button type="submit" className="admin-auth-submit" disabled={submitting}>
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
