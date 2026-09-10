import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangleIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, LockIcon, ShieldCheckIcon } from '@shared/app/components/UiIcons';
import { PasswordField } from '@shared/app/components/PasswordField';
import { useToast } from '@shared/app/components/ToastProvider';
import { AdminAuthShell } from './AdminAuthShell';
import { resetPassword, validateResetToken } from './services/authService';
import { passwordScore, PASSWORD_STRENGTH_HINT } from './validators';

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

// The raw token is a hex-encoded SHA-256-sized (32-byte) random value — see
// AcutisPasswordService.GenerateToken. Anything else in the token slot could not possibly be a
// real reset token, so it's rejected client-side before ever reaching the API.
const TOKEN_PATTERN = /^[0-9a-fA-F]{64}$/;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const rawToken = searchParams.get('token')?.trim() ?? '';
  const token = TOKEN_PATTERN.test(rawToken) ? rawToken : '';
  const returnUrl = searchParams.get('returnUrl');
  const clientId = searchParams.get('client_id');
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  // Read-only check of the token itself, run once on mount — confirms which account this link
  // resets (shown above the form) and rejects an already-used/expired link immediately, instead
  // of only after the visitor fills in a new password and submits.
  const [checkingToken, setCheckingToken] = useState(true);
  const [tokenError, setTokenError] = useState('');
  const [accountEmail, setAccountEmail] = useState('');

  const { register, handleSubmit, control, trigger, formState: { errors, dirtyFields } } = useForm<ResetPasswordFormValues>({
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });
  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });
  const score = passwordScore(passwordValue);

  // Re-check the confirm-password field as the new password changes, so a stale
  // "passwords do not match" error clears/appears immediately instead of on its own next keystroke.
  useEffect(() => {
    if (dirtyFields.confirmPassword) {
      void trigger('confirmPassword');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only passwordValue should retrigger this
  }, [passwordValue]);

  const loginTarget = useMemo(() => {
    const params = new URLSearchParams();
    if (returnUrl) params.set('returnUrl', returnUrl);
    if (clientId) params.set('client_id', clientId);
    if (!returnUrl && !clientId) params.set('entry', 'platform');
    return `/login?${params.toString()}`;
  }, [returnUrl, clientId]);

  const recoveryTarget = useMemo(() => {
    const params = new URLSearchParams();
    if (returnUrl) params.set('returnUrl', returnUrl);
    if (clientId) params.set('client_id', clientId);
    return `/forgot-password${params.size ? `?${params.toString()}` : ''}`;
  }, [returnUrl, clientId]);

  // Strip the token out of the visible URL/browser history as soon as it's read into state — a
  // single-use secret has no reason to keep sitting in the address bar or a bookmark/history
  // entry once the page has it, and this is the first line of defense against later leaking via
  // the Referer header if the user ever follows an outbound link before submitting the form.
  useEffect(() => {
    if (!token) return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has('token')) return;
    url.searchParams.delete('token');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per mount, not on every token identity check
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!token) {
        setCheckingToken(false);
        return;
      }
      try {
        const { resultData } = await validateResetToken(token);
        if (cancelled) return;
        const data = resultData as { email?: string } | null | undefined;
        setAccountEmail(data?.email ?? '');
      } catch (err) {
        if (cancelled) return;
        setTokenError(typeof err === 'string' ? err : 'This reset link is invalid or has expired.');
      } finally {
        if (!cancelled) setCheckingToken(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per mount against this token
  }, []);

  const submit = handleSubmit(async (values) => {
    setServerError('');
    setSubmitting(true);
    try {
      await resetPassword({ token, newPassword: values.password, confirmPassword: values.confirmPassword });
      showToast('Your password has been reset.', 'success');
      setComplete(true);
    } catch (err) {
      const message = typeof err === 'string' ? err : 'This reset link is invalid or has expired.';
      setServerError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  });

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

  if (checkingToken) {
    return (
      <AdminAuthShell>
        <section className="admin-auth-card">
          <div className="admin-auth-success" aria-live="polite">
            <span className="admin-auth-spinner" aria-hidden="true" />
            <span className="admin-auth-card__kicker">Checking Your Link</span>
            <p>Please wait a moment…</p>
          </div>
        </section>
      </AdminAuthShell>
    );
  }

  if (tokenError) {
    return (
      <AdminAuthShell>
        <section className="admin-auth-card">
          <div className="admin-auth-success" aria-live="polite">
            <span className="admin-auth-success__icon"><AlertTriangleIcon size={22} /></span>
            <span className="admin-auth-card__kicker">Link Not Valid</span>
            <h2>This Link Can&apos;t Be Used</h2>
            <p>{tokenError}</p>
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
            <h2>Password Successfully Updated</h2>
            <p>Your password has been changed successfully. Please sign in again using your new password.</p>
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
              <p className="admin-auth-card__description">
                {accountEmail ? <>Choose a new password for <strong>{accountEmail}</strong>.</> : 'Choose a new password for your account.'}
              </p>
            </div>
            <form id="formResetPassword" onSubmit={submit} className="admin-auth-form" noValidate>
              <div className="admin-auth-field">
                <PasswordField
                  id="txtNewPassword"
                  label="New Password"
                  visible={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                  disabled={submitting}
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Enter a new password.',
                    validate: (value) => passwordScore(value) >= 3 || PASSWORD_STRENGTH_HINT,
                  })}
                />
                <div className="admin-auth-strength" aria-label={`Password strength ${score} of 4`}>
                  {[1, 2, 3, 4].map((bar) => <span key={bar} className={bar <= score ? `is-level-${score}` : ''} />)}
                </div>
                <p className="admin-auth-field-hint">Use 8+ characters with a mix of letters, numbers, and symbols.</p>
              </div>

              <div className="admin-auth-field">
                <PasswordField
                  id="txtConfirmPassword"
                  label="Confirm New Password"
                  visible={showConfirm}
                  onToggle={() => setShowConfirm((value) => !value)}
                  disabled={submitting}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: 'Confirm your new password.',
                    validate: (value, formValues) => value === formValues.password || 'Passwords do not match.',
                  })}
                />
              </div>

              {serverError ? (
                <div className="admin-auth-banner" role="alert">
                  <AlertTriangleIcon size={15} />
                  <span>{serverError}</span>
                </div>
              ) : null}

              <button id="btnResetPassword" type="submit" className="admin-auth-submit" disabled={submitting}>
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
            <div className="admin-auth-security-note"><LockIcon size={14} /><span>This link can only be used once and will expire soon.</span></div>
          </>
        )}
      </section>
    </AdminAuthShell>
  );
}
