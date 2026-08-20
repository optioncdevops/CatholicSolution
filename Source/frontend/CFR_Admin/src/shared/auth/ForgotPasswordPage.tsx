import { useMemo, useState, type FormEvent } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, MailIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';
import { AuthShell } from './AuthShell';

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
    <AuthShell>
      <div className="auth-login-stack">
        <section className="auth-card auth-login-card auth-reset-card">
          {submittedEmail ? (
            <div className="auth-reset-success" aria-live="polite">
              <span className="auth-reset-success__icon"><CheckIcon size={24} /></span>
              <span className="auth-card__kicker">Recovery requested</span>
              <h2>Check your email</h2>
              <p>If an account matches <strong>{submittedEmail}</strong>, the configured identity service will send a short-lived verification code or secure reset link.</p>
              <PlatformLink to={resetTarget} className="auth-primary-button auth-primary-button--large">
                I have a reset code <ArrowRightIcon size={17} />
              </PlatformLink>
              <div className="auth-reset-success__actions">
                <button type="button" className="auth-text-link" onClick={() => setSubmittedEmail('')}>Use a different email</button>
                <PlatformLink to={loginTarget} className="auth-text-link">Return to sign in</PlatformLink>
              </div>
            </div>
          ) : (
            <>
              <PlatformLink to={loginTarget} className="auth-back-link"><ArrowLeftIcon size={15} /> Back to sign in</PlatformLink>
              <div className="auth-card__header auth-reset-card__header">
                <span className="auth-reset-card__mark"><ShieldCheckIcon size={22} /></span>
                <span className="auth-card__kicker">Account recovery</span>
                <h2>Forgot your password?</h2>
                <p>Enter the email connected to your Catholic Solutions account. For privacy, the response is the same whether or not an account exists.</p>
              </div>
              <form onSubmit={submit} className="auth-form">
                <div>
                  <label className="auth-label" htmlFor="reset-email">Email address</label>
                  <div className="auth-input-wrap mt-2">
                    <span className="auth-input-icon"><MailIcon size={17} /></span>
                    <input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input" autoComplete="email" placeholder="name@organization.org" required autoFocus />
                  </div>
                </div>
                <button type="submit" className="auth-primary-button auth-primary-button--large">Send recovery instructions <ArrowRightIcon size={17} /></button>
              </form>
              <div className="auth-reset-security-note"><ShieldCheckIcon size={14} /><span>Recovery requests should expire and be rate-limited by the connected identity service.</span></div>
            </>
          )}
        </section>
      </div>
    </AuthShell>
  );
}
