import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { environment } from '@shared/platform/config/environment';
import { canRedirectToExternalIdentityProvider, clearPreviewSession, createPreviewSession, hasPreviewSession } from './centralAuth';
import { clearPortalSession } from '@app/config/appPortalClient';
import { loginPortal } from '@/modules/authentication/services/portalAuthService';

export interface SignInRequest {
  email: string;
  password?: string;
  remember?: boolean;
  provider?: 'password' | 'google' | 'microsoft';
  clientId?: string;
  returnUrl?: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  signIn: (request: SignInRequest) => Promise<'authenticated' | 'redirected' | 'unavailable'>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const sessionChannelName = `catholic-solutions.auth.${environment.appId}.sync`;
type SessionSignal = 'signed-in' | 'signed-out';
let sessionChannel: BroadcastChannel | null = null;

function sessionSync() {
  if (typeof BroadcastChannel === 'undefined') return null;
  sessionChannel ??= new BroadcastChannel(sessionChannelName);
  return sessionChannel;
}

function redirectToIdentityProvider(request: SignInRequest) {
  if (!canRedirectToExternalIdentityProvider() || typeof window === 'undefined') return false;
  const authUrl = new URL('/login', environment.authOrigin);
  authUrl.searchParams.set('client_id', request.clientId || environment.appId);
  authUrl.searchParams.set('returnUrl', request.returnUrl || window.location.href);
  if (request.provider && request.provider !== 'password') authUrl.searchParams.set('provider', request.provider);
  window.location.assign(authUrl.toString());
  return true;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setAuthenticated] = useState(hasPreviewSession);

  useEffect(() => {
    const channel = sessionSync();
    const refreshSession = () => {
      if (environment.authMode !== 'sso') setAuthenticated(hasPreviewSession());
    };
    const onSignal = (event: MessageEvent<SessionSignal>) => {
      if (event.data === 'signed-out') setAuthenticated(false);
      else if (event.data === 'signed-in') setAuthenticated(true);
    };
    const onVisibility = () => { if (!document.hidden) refreshSession(); };

    channel?.addEventListener('message', onSignal);
    window.addEventListener('focus', refreshSession);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      channel?.removeEventListener('message', onSignal);
      window.removeEventListener('focus', refreshSession);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated,
    async signIn(request) {
      if (environment.authMode === 'sso') {
        return redirectToIdentityProvider(request) ? 'redirected' : 'unavailable';
      }
      if (request.provider === 'password') {
        await loginPortal(request.email, request.password ?? '');
      }
      createPreviewSession(Boolean(request.remember));
      setAuthenticated(true);
      sessionSync()?.postMessage('signed-in');
      return 'authenticated';
    },
    signOut() {
      clearPortalSession();
      clearPreviewSession();
      setAuthenticated(false);
      sessionSync()?.postMessage('signed-out');
    },
  }), [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
