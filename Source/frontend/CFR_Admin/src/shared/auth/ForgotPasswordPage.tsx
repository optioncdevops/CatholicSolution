import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AlertTriangleIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, MailIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';
import { AdminAuthShell } from './AdminAuthShell';
import { forgotPassword } from './services/authService';

export function ForgotPasswordPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email')?.trim() ?? '';
  const { showToast } = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const loginTarget = useMemo(() => `/login${location.search}`, [location.search]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Enter the email connected to your account.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await forgotPassword({ userName: trimmedEmail });
      showToast('Password reset instructions sent.', 'success');
      setSubmittedEmail(trimmedEmail);
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Something went wrong. Please try again.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
              <button type="button" className="admin-auth-text-link" onClick={() => setSubmittedEmail('')}>Use a Different Email</button>
              <Link to={loginTarget} className="admin-auth-text-link">Return to Sign In</Link>
            </div>
          </div>
        ) : (
          <>
            <Link to={loginTarget} className="admin-auth-back-link"><ArrowLeftIcon size={13} /> Back to Sign In</Link>
            <div className="admin-auth-card__header">
              <span className="admin-auth-card__mark"><ShieldCheckIcon size={20} /></span>
              <span className="admin-auth-card__kicker">Account Recovery</span>
              <h1 className="admin-auth-card__title">Forgot Your Password?</h1>
              <p className="admin-auth-card__description">Enter the email connected to your account and we&apos;ll send you a secure password reset link.</p>
            </div>
            <form onSubmit={(event) => void submit(event)} className="admin-auth-form" noValidate>
              <div className="admin-auth-field">
                <label className="admin-auth-label" htmlFor="reset-email">Email Address</label>
                <div className="admin-auth-input-wrap">
                  <span className="admin-auth-input-icon"><MailIcon size={15} /></span>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="admin-auth-input"
                    autoComplete="email"
                    placeholder="name@organization.org"
                    required
                    autoFocus
                    disabled={submitting}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'reset-email-error' : undefined}
                  />
                </div>
              </div>

              {error ? (
                <div id="reset-email-error" className="admin-auth-banner" role="alert">
                  <AlertTriangleIcon size={15} />
                  <span>{error}</span>
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
                    Send Recovery Instructions <ArrowRightIcon size={15} />
                  </>
                )}
              </button>
            </form>
            <div className="admin-auth-security-note"><ShieldCheckIcon size={14} /><span>Recovery requests expire and are rate-limited by the connected identity service.</span></div>
          </>
        )}
      </section>
    </AdminAuthShell>
  );
}
