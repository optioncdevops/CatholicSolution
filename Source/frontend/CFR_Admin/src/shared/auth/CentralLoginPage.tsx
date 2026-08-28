import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@shared/app/components/ToastProvider';
import { environment } from '@shared/platform/config/environment';
import { AdminAuthShell } from './AdminAuthShell';
import { AdminLoginCard } from './AdminLoginCard';
import { useAuth } from './AuthProvider';
import { getSafeReturnUrl, toAbsoluteReturnUrl } from './centralAuth';

function isAbsolute(value: string) {
  return /^https?:\/\//i.test(value);
}

const DEMO_EMAIL = 'priya.nair@cfracutis.org';
const DEMO_PASSWORD = 'password';

/**
 * cfr-admin's own `/login` route. This project is the Super Admin console only — it never
 * serves the CFR Portal's member-facing sign-in — so this always renders the distinct Admin
 * experience regardless of query params. (A previous version branched on a `client_id` query
 * param that some redirects forgot to set, silently falling back to the generic CFR design.)
 */
export function CentralLoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const destination = useMemo(() => getSafeReturnUrl(location.search, '/admin'), [location.search]);
  const requiresInteractiveSignIn = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('entry') === 'platform';
  }, [location.search]);
  const { isAuthenticated, signIn } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [interactiveSignInCompleted, setInteractiveSignInCompleted] = useState(false);
  const [email, setEmail] = useState(import.meta.env.DEV ? DEMO_EMAIL : '');
  const [password, setPassword] = useState(import.meta.env.DEV ? DEMO_PASSWORD : '');

  // The mock auth provider always succeeds, so this simulates real validation/invalid-credential/
  // loading states locally without touching AuthProvider's contract.
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const completeCentralReturn = useCallback(() => {
    if (!isAbsolute(destination)) {
      navigate(destination, { replace: true });
      return;
    }
    window.location.replace(destination);
  }, [destination, navigate]);

  useEffect(() => {
    if (isAuthenticated && (!requiresInteractiveSignIn || interactiveSignInCompleted)) {
      completeCentralReturn();
    }
  }, [completeCentralReturn, interactiveSignInCompleted, isAuthenticated, requiresInteractiveSignIn]);

  const completeSignIn = async () => {
    const result = await signIn({
      email,
      password,
      remember: true,
      provider: 'password',
      clientId: environment.appId,
      returnUrl: toAbsoluteReturnUrl(destination),
    });
    if (result === 'authenticated') {
      setInteractiveSignInCompleted(true);
      showToast('Signed in to CFR Acutis');
    } else if (result === 'unavailable') {
      showToast('The configured identity service is unavailable. Please contact your administrator.');
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = 'Enter your email address.';
    if (!password) errors.password = 'Enter your password.';
    if (errors.email || errors.password) {
      setFieldErrors(errors);
      (errors.email ? emailRef : passwordRef).current?.focus();
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      await completeSignIn();
    } catch (error) {
      setFormError(typeof error === 'string' ? error : 'Invalid email or password. Check your credentials and try again.');
      passwordRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminAuthShell>
      <AdminLoginCard
        email={email}
        onEmailChange={(value) => { setEmail(value); if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: undefined })); }}
        password={password}
        onPasswordChange={(value) => { setPassword(value); if (fieldErrors.password) setFieldErrors((current) => ({ ...current, password: undefined })); }}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword((value) => !value)}
        onSubmit={(event) => void submit(event)}
        submitting={submitting}
        formError={formError}
        fieldErrors={fieldErrors}
        emailRef={emailRef}
        passwordRef={passwordRef}
        forgotHref={`/forgot-password${location.search}`}
      />
    </AdminAuthShell>
  );
}
