import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@shared/app/components/ToastProvider';
import { environment } from '@shared/platform/config/environment';
import { AdminAuthShell } from './AdminAuthShell';
import { AdminLoginCard } from './AdminLoginCard';
import { useAuth } from './AuthProvider';
import { toAbsoluteReturnUrl } from './centralAuth';

function isAbsolute(value: string) {
  return /^https?:\/\//i.test(value);
}

const DEMO_EMAIL = 'priya.nair@cfracutis.org';
const DEMO_PASSWORD = 'password';

// Signing in always lands on the dashboard — never wherever the user happened to be
// (or was deep-linked to) before their session expired or they hit /login directly.
const POST_LOGIN_DESTINATION = '/admin';

interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * cfr-admin's own `/login` route. This project is the Super Admin console only — it never
 * serves the CFR Portal's member-facing sign-in — so this always renders the distinct Admin
 * experience regardless of query params. (A previous version branched on a `client_id` query
 * param that some redirects forgot to set, silently falling back to the generic CFR design.)
 */
export function CentralLoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const destination = POST_LOGIN_DESTINATION;
  const requiresInteractiveSignIn = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('entry') === 'platform';
  }, [location.search]);
  const { isAuthenticated, signIn } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [interactiveSignInCompleted, setInteractiveSignInCompleted] = useState(false);

  // The mock auth provider always succeeds, so this simulates real validation/invalid-credential/
  // loading states locally without touching AuthProvider's contract.
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, setFocus, formState: { errors, isValid } } = useForm<LoginFormValues>({
    defaultValues: {
      email: import.meta.env.DEV ? DEMO_EMAIL : '',
      password: import.meta.env.DEV ? DEMO_PASSWORD : '',
    },
    mode: 'onChange',
  });

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

  const completeSignIn = async (values: LoginFormValues) => {
    const result = await signIn({
      email: values.email,
      password: values.password,
      remember: true,
      provider: 'password',
      clientId: environment.appId,
      returnUrl: toAbsoluteReturnUrl(destination),
    });
    if (result === 'authenticated') {
      setInteractiveSignInCompleted(true);
    } else if (result === 'unavailable') {
      showToast('The configured identity service is unavailable. Please contact your administrator.', 'error');
    }
  };

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await completeSignIn(values);
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Invalid email or password. Check your credentials and try again.';
      setFormError(message);
      showToast(message, 'error');
      setFocus('password');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AdminAuthShell>
      <AdminLoginCard
        emailRegister={register('email', { required: 'Enter your email address.' })}
        passwordRegister={register('password', { required: 'Enter your password.' })}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword((value) => !value)}
        onSubmit={submit}
        submitting={submitting}
        canSubmit={isValid && !submitting}
        formError={formError}
        emailError={errors.email?.message}
        passwordError={errors.password?.message}
        forgotHref={`/forgot-password${location.search}`}
      />
    </AdminAuthShell>
  );
}
