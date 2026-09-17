import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, LockIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';
import { AuthShell } from '../components/AuthShell';
import { passwordScore, validateResetPassword } from '../validator/AuthenticationValidator';
import { ResetPasswordField } from './partials/ResetPasswordField';

const ResetPasswordPage = () => {
  //#region Hooks
  const [searchParams] = useSearchParams();
  //#endregion

  //#region States
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
  //#endregion

  //#region Handlers
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const messages = validateResetPassword(code, password, confirmPassword);
    if (messages.length) {
      setError(messages[0]);
      return;
    }
    setError('');
    setComplete(true);
  };
  //#endregion

  //#region Render
  return (
    <AuthShell>
      <div className="auth-login-stack">
        <section className="auth-card auth-login-card auth-reset-card auth-reset-password-card">
          {complete ? (
            <div className="auth-reset-success" aria-live="polite">
              <span className="auth-reset-success__icon"><CheckIcon size={24} /></span>
              <span className="auth-card__kicker">Password updated</span>
              <h2>Your password is ready</h2>
              <p>Your password has been changed for this prototype recovery flow. Sign in again with your new password.</p>
              <PlatformLink to={loginTarget} className="auth-primary-button auth-primary-button--large">
                Continue to sign in <ArrowRightIcon size={17} />
              </PlatformLink>
            </div>
          ) : (
            <>
              <PlatformLink to={recoveryTarget} className="auth-back-link"><ArrowLeftIcon size={15} /> Back to recovery</PlatformLink>
              <div className="auth-card__header auth-reset-card__header">
                <span className="auth-reset-card__mark"><ShieldCheckIcon size={22} /></span>
                <span className="auth-card__kicker">Secure password reset</span>
                <h2>Create a new password</h2>
                <p>{email ? <>Resetting access for <strong>{email}</strong>.</> : 'Enter your recovery code and choose a new password.'}</p>
              </div>
              <form onSubmit={submit} className="auth-form auth-reset-form" noValidate>
                <div>
                  <label className="auth-label" htmlFor="reset-code">Verification code</label>
                  <div className="auth-input-wrap mt-2">
                    <span className="auth-input-icon"><ShieldCheckIcon size={17} /></span>
                    <input id="reset-code" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} className="auth-input auth-reset-code-input" autoComplete="one-time-code" placeholder="6-digit code" required autoFocus />
                  </div>
                  <p className="auth-field-hint">Use the code sent to your recovery email. Codes should expire after a short period when connected to the identity service.</p>
                </div>

                <ResetPasswordField id="new-password" label="New password" value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} />
                <div className="auth-password-strength" aria-label={`Password strength ${score} of 4`}>
                  {[1, 2, 3, 4].map((bar) => <span key={bar} className={bar <= score ? `is-active is-level-${score}` : ''} />)}
                </div>
                <p className="auth-field-hint">8+ characters with upper/lowercase letters and a number. A symbol is recommended.</p>

                <ResetPasswordField id="confirm-password" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} visible={showConfirm} onToggle={() => setShowConfirm((value) => !value)} />
                {error ? <div className="auth-form-error" role="alert">{error}</div> : null}

                <button type="submit" className="auth-primary-button auth-primary-button--large">Reset password <ArrowRightIcon size={17} /></button>
              </form>
              <div className="auth-reset-security-note"><LockIcon size={14} /><span>For production, reset codes and password changes must be validated by the configured identity provider or backend service.</span></div>
            </>
          )}
        </section>
      </div>
    </AuthShell>
  );
  //#endregion
};

export default ResetPasswordPage;
