import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@shared/app/components/ToastProvider';
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from '@shared/app/components/UiIcons';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';
import { environment } from '@shared/platform/config/environment';
import { SOLUTION_REGISTRY } from '@shared/platform/config/solutionRegistry';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../context/AuthProvider';
import { getAuth0SocialConnection, loginAuth0Password } from '../services/auth0AuthService';
import type { SignInProvider } from '../types/authenticationTypes';
import { AUTH0_LOGIN_PATH, AUTH0_POST_LOGIN_PATH } from '../utils/auth0Session';
import { getRequestedClientId, getSafeReturnUrl, isAbsoluteUrl, storeCentralAuthHandoff, toAbsoluteReturnUrl } from '../utils/authenticationHelpers';
import { validateLoginCredentials } from '../validator/AuthenticationValidator';

const LoginPage = () => {
  //#region Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, signIn } = useAuth();
  const { loginWithRedirect } = useAuth0();
  const { showToast } = useToast();
  const isAuth0Login = location.pathname.replace(/\/+$/, '') === AUTH0_LOGIN_PATH;
  //#endregion

  //#region States
  const clientId = useMemo(() => getRequestedClientId(location.search), [location.search]);
  const destination = useMemo(() => getSafeReturnUrl(location.search, '/apps'), [location.search]);
  const requiresInteractiveSignIn = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return isAuth0Login || ((clientId === 'platform' || clientId === 'cfr-admin') && params.get('entry') === 'platform');
  }, [clientId, isAuth0Login, location.search]);
  const client = SOLUTION_REGISTRY[clientId];
  const [showPassword, setShowPassword] = useState(false);
  const [interactiveSignInCompleted, setInteractiveSignInCompleted] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState(!isAuth0Login && environment.authMode === 'mock' ? 'carl.lapp@optionc.com' : '');
  const [password, setPassword] = useState(!isAuth0Login && environment.authMode === 'mock' ? 'demo1234' : '');
  //#endregion

  // Re-stash whatever this page resolved (whether it arrived via query string or an earlier
  // handoff) so the "Forgot password?"/"Request access" links below — and a page refresh here —
  // don't need client_id/returnUrl back in their own URLs either.
  useEffect(() => {
    storeCentralAuthHandoff({ clientId, returnUrl: destination });
  }, [clientId, destination]);

  //#region Functions
  const completeCentralReturn = useCallback(() => {
    if (!isAbsoluteUrl(destination)) {
      navigate(destination, { replace: true });
      return;
    }
    window.location.replace(destination);
  }, [destination, navigate]);
  //#endregion

  //#region Effects
  useEffect(() => {
    if (isAuthenticated && (!requiresInteractiveSignIn || interactiveSignInCompleted)) {
      completeCentralReturn();
    }
  }, [completeCentralReturn, interactiveSignInCompleted, isAuthenticated, requiresInteractiveSignIn]);
  //#endregion

  //#region Handlers
  const completeSignIn = async (provider: SignInProvider) => {
    const messages = provider === 'password' ? validateLoginCredentials(email, password) : [];
    if (messages.length) {
      showToast(messages[0]);
      return;
    }
    try {
      if (isAuth0Login) {
        if (provider === 'password') {
          await loginAuth0Password(email, password, remember);
          showToast('Signed in to Catholic Solutions');
          window.location.replace(AUTH0_POST_LOGIN_PATH);
          return;
        }
        await loginWithRedirect({
          authorizationParams: {
            connection: getAuth0SocialConnection(provider),
          },
        });
        return;
      }
      const result = await signIn({
        email,
        password,
        remember,
        provider,
        clientId,
        returnUrl: toAbsoluteReturnUrl(destination),
      });
      if (result === 'authenticated') {
        setInteractiveSignInCompleted(true);
        showToast(clientId === 'platform' ? 'Signed in to Catholic Solutions' : clientId === 'cfr-admin' ? 'Signed in to CFRAdmin' : `Signed in. Returning to ${client.name}`);
      } else if (result === 'unavailable') {
        showToast('The configured identity service is unavailable. Please contact your administrator.');
      }
    } catch (error) {
      showToast(typeof error === 'string' ? error : 'Invalid email or password.');
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void completeSignIn('password');
  };
  //#endregion

  //#region Render
  return (
    <AuthShell>
      <div className="auth-login-stack">
        <section className="auth-card auth-login-card">
          <div className="auth-card__header">
            <span className="auth-card__kicker">Central member sign in</span>
            <h2>Welcome back</h2>
            <p>{clientId === 'platform' ? 'Sign in to continue to your Catholic Solutions workspace.' : `Sign in once to continue securely to ${client.name}.`}</p>
          </div>

          <form onSubmit={submit} className="auth-form">
            <div>
              <label className="auth-label" htmlFor="email">Email address</label>
              <div className="auth-input-wrap mt-1.5">
                <span className="auth-input-icon"><MailIcon size={16} /></span>
                <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input" autoComplete="email" required />
              </div>
            </div>

            <div>
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="password">Password</label>
                <PlatformLink to="/forgot-password" className="auth-text-link">Forgot password?</PlatformLink>
              </div>
              <div className="auth-input-wrap mt-1.5">
                <span className="auth-input-icon"><LockIcon size={16} /></span>
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input auth-input--with-action" autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="auth-input-action" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}</button>
              </div>
            </div>

            <label className="auth-checkbox auth-checkbox--login"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> <span>Keep me signed in on this device</span></label>

            <button type="submit" className="auth-primary-button auth-primary-button--large">Sign in securely <ArrowRightIcon size={16} /></button>

            <div className="auth-divider"><span>Or continue with</span></div>
            <div className="auth-sso-grid">
              <button type="button" onClick={() => void completeSignIn('google')} className="auth-sso-button"><span className="auth-google-mark">G</span><span>Google</span></button>
              <button type="button" onClick={() => void completeSignIn('microsoft')} className="auth-sso-button"><span className="auth-microsoft-mark" aria-hidden="true"><i/><i/><i/><i/></span><span>Microsoft</span></button>
            </div>
          </form>
        </section>

        {clientId !== 'cfr-admin' ? (
          <section className="auth-access-callout auth-access-callout--compact">
            <div className="auth-access-callout__copy"><strong>New to Catholic Solutions?</strong><span>Request organization access.</span></div>
            <PlatformLink to="/request-access" className="auth-access-callout__action">Request access <ArrowRightIcon size={15} /></PlatformLink>
          </section>
        ) : null}
      </div>
    </AuthShell>
  );
  //#endregion
};

export default LoginPage;
