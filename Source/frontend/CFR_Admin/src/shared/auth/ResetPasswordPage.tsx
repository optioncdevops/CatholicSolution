import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangleIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, EyeIcon, EyeOffIcon, LockIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';
import { useToast } from '@shared/app/components/ToastProvider';
import { AdminAuthShell } from './AdminAuthShell';
import { resetPassword } from './services/authService';

function passwordScore(value: string) {
  return [
    value.length >= 8,
    /[A-Z]/.test(value) && /[a-z]/.test(value),
    /[0-9]/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ].filter(Boolean).length;
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const email = searchParams.get('email')?.trim() ?? '';
  const returnUrl = searchParams.get('returnUrl');
  const clientId = searchParams.get('client_id');
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const score = useMemo(() => passwordScore(password), [password]);

  const loginTarget = useMemo(() => {
    const params = new URLSearchParams();
    if (returnUrl) params.set('returnUrl', returnUrl);
    if (clientId) params.set('client_id', clientId);
    if (!returnUrl && !clientId) params.set('entry', 'platform');
    return `/login?${params.toString()}`;
  }, [returnUrl, clientId]);

  const recoveryTarget = useMemo(() => {
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    if (returnUrl) params.set('returnUrl', returnUrl);
    if (clientId) params.set('client_id', clientId);
    return `/forgot-password${params.size ? `?${params.toString()}` : ''}`;
  }, [email, returnUrl, clientId]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (score < 3) { setError('Use at least 8 characters with upper/lowercase letters, a number, and preferably a symbol.'); return; }
    if (password !== confirmPassword) { setError('The new passwords do not match.'); return; }

    setError('');
    setSubmitting(true);
    try {
      await resetPassword({ token, newPassword: password, confirmPassword });
      showToast('Your password has been reset.', 'success');
      setComplete(true);
    } catch (err) {
      const message = typeof err === 'string' ? err : 'This reset link is invalid or has expired.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AdminAuthShell>
        <section className="admin-auth-card">
          <div className="admin-auth-success" aria-live="polite">
            <span className="admin-auth-success__icon"><AlertTriangleIcon size={22} /></span>
            <span className="admin-auth-card__kicker">Link Required</span>
            <h2>This Link Is Incomplete</h2>
            <p>Open the password reset link from your email, or request a new one.</p>
            <Link to={recoveryTarget} className="admin-auth-submit admin-auth-submit--link">
              Request a New Link <ArrowRightIcon size={15} />
            </Link>
          </div>
        </section>
      </AdminAuthShell>
    );
  }

  return (
    <AdminAuthShell>
      <section className="admin-auth-card">
        {complete ? (
          <div className="admin-auth-success" aria-live="polite">
            <span className="admin-auth-success__icon"><CheckIcon size={22} /></span>
            <span className="admin-auth-card__kicker">Password Updated</span>
            <h2>Your Password Is Ready</h2>
            <p>Your password has been changed. Sign in again with your new password.</p>
            <Link to={loginTarget} className="admin-auth-submit admin-auth-submit--link">
              Continue to Sign In <ArrowRightIcon size={15} />
            </Link>
          </div>
        ) : (
          <>
            <Link to={recoveryTarget} className="admin-auth-back-link"><ArrowLeftIcon size={13} /> Back to Recovery</Link>
            <div className="admin-auth-card__header">
              <span className="admin-auth-card__mark"><ShieldCheckIcon size={20} /></span>
              <span className="admin-auth-card__kicker">Secure Password Reset</span>
              <h1 className="admin-auth-card__title">Create a New Password</h1>
              <p className="admin-auth-card__description">{email ? <>Resetting access for <strong>{email}</strong>.</> : 'Choose a new password for your account.'}</p>
            </div>
            <form onSubmit={(event) => void submit(event)} className="admin-auth-form" noValidate>
              <div className="admin-auth-field">
                <PasswordField id="new-password" label="New Password" value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} disabled={submitting} />
                <div className="admin-auth-strength" aria-label={`Password strength ${score} of 4`}>
                  {[1, 2, 3, 4].map((bar) => <span key={bar} className={bar <= score ? `is-level-${score}` : ''} />)}
                </div>
                <p className="admin-auth-field-hint">8+ characters with upper/lowercase letters and a number. A symbol is recommended.</p>
              </div>

              <div className="admin-auth-field">
                <PasswordField id="confirm-password" label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} visible={showConfirm} onToggle={() => setShowConfirm((value) => !value)} disabled={submitting} />
              </div>

              {error ? (
                <div className="admin-auth-banner" role="alert">
                  <AlertTriangleIcon size={15} />
                  <span>{error}</span>
                </div>
              ) : null}

              <button type="submit" className="admin-auth-submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="admin-auth-spinner" aria-hidden="true" />
                    Resetting…
                  </>
                ) : (
                  <>
                    Reset Password <ArrowRightIcon size={15} />
                  </>
                )}
              </button>
            </form>
            <div className="admin-auth-security-note"><LockIcon size={14} /><span>This reset link can only be used once and expires automatically.</span></div>
          </>
        )}
      </section>
    </AdminAuthShell>
  );
}

function PasswordField({ id, label, value, onChange, visible, onToggle, disabled }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <>
      <label className="admin-auth-label" htmlFor={id}>{label}</label>
      <div className="admin-auth-input-wrap">
        <span className="admin-auth-input-icon"><LockIcon size={15} /></span>
        <input id={id} type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} className="admin-auth-input admin-auth-input--with-action" autoComplete="new-password" required disabled={disabled} />
        <button type="button" className="admin-auth-input-action" onClick={onToggle} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} disabled={disabled}>{visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}</button>
      </div>
    </>
  );
}
