import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, EyeIcon, EyeOffIcon, LockIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';
import { AdminAuthShell } from './AdminAuthShell';

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
  const email = searchParams.get('email')?.trim() ?? '';
  const returnUrl = searchParams.get('returnUrl');
  const clientId = searchParams.get('client_id');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const score = useMemo(() => passwordScore(password), [password]);
  const loginParams = new URLSearchParams();
  if (returnUrl) loginParams.set('returnUrl', returnUrl);
  if (clientId) loginParams.set('client_id', clientId);
  if (!returnUrl && !clientId) loginParams.set('entry', 'platform');
  const loginTarget = `/login?${loginParams.toString()}`;
  const recoveryParams = new URLSearchParams();
  if (email) recoveryParams.set('email', email);
  if (returnUrl) recoveryParams.set('returnUrl', returnUrl);
  if (clientId) recoveryParams.set('client_id', clientId);
  const recoveryTarget = `/forgot-password${recoveryParams.size ? `?${recoveryParams.toString()}` : ''}`;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.trim().length < 6) { setError('Enter the 6-digit verification code from your recovery email.'); return; }
    if (score < 3) { setError('Use at least 8 characters with upper/lowercase letters, a number, and preferably a symbol.'); return; }
    if (password !== confirmPassword) { setError('The new passwords do not match.'); return; }
    setError('');
    setComplete(true);
  };

  return (
    <AdminAuthShell>
      <section className="admin-auth-card">
        {complete ? (
          <div className="admin-auth-success" aria-live="polite">
            <span className="admin-auth-success__icon"><CheckIcon size={22} /></span>
            <span className="admin-auth-card__kicker">Password Updated</span>
            <h2>Your Password Is Ready</h2>
            <p>Your password has been changed for this prototype recovery flow. Sign in again with your new password.</p>
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
              <p className="admin-auth-card__description">{email ? <>Resetting access for <strong>{email}</strong>.</> : 'Enter your recovery code and choose a new password.'}</p>
            </div>
            <form onSubmit={submit} className="admin-auth-form" noValidate>
              <div className="admin-auth-field">
                <label className="admin-auth-label" htmlFor="reset-code">Verification Code</label>
                <div className="admin-auth-input-wrap">
                  <span className="admin-auth-input-icon"><ShieldCheckIcon size={15} /></span>
                  <input id="reset-code" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} className="admin-auth-input" autoComplete="one-time-code" placeholder="6-digit code" required autoFocus />
                </div>
                <p className="admin-auth-field-hint">Use the code sent to your recovery email. Codes expire after a short period.</p>
              </div>

              <div className="admin-auth-field">
                <PasswordField id="new-password" label="New Password" value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} />
                <div className="admin-auth-strength" aria-label={`Password strength ${score} of 4`}>
                  {[1, 2, 3, 4].map((bar) => <span key={bar} className={bar <= score ? `is-level-${score}` : ''} />)}
                </div>
                <p className="admin-auth-field-hint">8+ characters with upper/lowercase letters and a number. A symbol is recommended.</p>
              </div>

              <div className="admin-auth-field">
                <PasswordField id="confirm-password" label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} visible={showConfirm} onToggle={() => setShowConfirm((value) => !value)} />
              </div>

              {error ? (
                <div className="admin-auth-banner" role="alert">
                  <ShieldCheckIcon size={15} />
                  <span>{error}</span>
                </div>
              ) : null}

              <button type="submit" className="admin-auth-submit">Reset Password <ArrowRightIcon size={15} /></button>
            </form>
            <div className="admin-auth-security-note"><LockIcon size={14} /><span>For production, reset codes and password changes must be validated by the configured identity provider.</span></div>
          </>
        )}
      </section>
    </AdminAuthShell>
  );
}

function PasswordField({ id, label, value, onChange, visible, onToggle }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <label className="admin-auth-label" htmlFor={id}>{label}</label>
      <div className="admin-auth-input-wrap">
        <span className="admin-auth-input-icon"><LockIcon size={15} /></span>
        <input id={id} type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} className="admin-auth-input admin-auth-input--with-action" autoComplete="new-password" required />
        <button type="button" className="admin-auth-input-action" onClick={onToggle} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>{visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}</button>
      </div>
    </>
  );
}
