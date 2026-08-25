import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, MailIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';
import { AdminAuthShell } from './AdminAuthShell';

export function ForgotPasswordPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email')?.trim() ?? '';
  const returnUrl = searchParams.get('returnUrl');
  const clientId = searchParams.get('client_id');
  const [email, setEmail] = useState(initialEmail);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const loginTarget = useMemo(() => `/login${location.search}`, [location.search]);
  const resetTarget = useMemo(() => {
    if (!submittedEmail) return '/reset-password';
    const params = new URLSearchParams({ email: submittedEmail });
    if (returnUrl) params.set('returnUrl', returnUrl);
    if (clientId) params.set('client_id', clientId);
    return `/reset-password?${params.toString()}`;
  }, [submittedEmail, returnUrl, clientId]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedEmail(email.trim());
  };

  return (
    <AdminAuthShell>
      <section className="admin-auth-card">
        {submittedEmail ? (
          <div className="admin-auth-success" aria-live="polite">
            <span className="admin-auth-success__icon"><CheckIcon size={22} /></span>
            <span className="admin-auth-card__kicker">Recovery Requested</span>
            <h2>Check Your Email</h2>
            <p>If an account matches <strong>{submittedEmail}</strong>, we&apos;ve sent a short-lived verification code or secure reset link.</p>
            <Link to={resetTarget} className="admin-auth-submit admin-auth-submit--link">
              I Have a Reset Code <ArrowRightIcon size={15} />
            </Link>
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
              <p className="admin-auth-card__description">Enter the email connected to your account. For your security, we show the same response whether or not an account exists.</p>
            </div>
            <form onSubmit={submit} className="admin-auth-form" noValidate>
              <div className="admin-auth-field">
                <label className="admin-auth-label" htmlFor="reset-email">Email Address</label>
                <div className="admin-auth-input-wrap">
                  <span className="admin-auth-input-icon"><MailIcon size={15} /></span>
                  <input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="admin-auth-input" autoComplete="email" placeholder="name@organization.org" required autoFocus />
                </div>
              </div>
              <button type="submit" className="admin-auth-submit">Send Recovery Instructions <ArrowRightIcon size={15} /></button>
            </form>
            <div className="admin-auth-security-note"><ShieldCheckIcon size={14} /><span>Recovery requests expire and are rate-limited by the connected identity service.</span></div>
          </>
        )}
      </section>
    </AdminAuthShell>
  );
}
