import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { environment } from '@shared/platform/config/environment';
import { AcutisAuthApiError, acutisLogin } from './acutisAuthApi';
import {
  canRedirectToExternalIdentityProvider,
  clearAcutisToken,
  getStoredAcutisSession,
  storeAcutisSession,
  type StoredAcutisSession,
} from './centralAuth';

export interface SignInRequest {
  email: string;
  password?: string;
  remember?: boolean;
  provider?: 'password' | 'google' | 'microsoft';
  clientId?: string;
  returnUrl?: string;
}

export type SignInResult = 'authenticated' | 'redirected' | 'unavailable' | 'invalid-credentials';

/** Real identity from CFR.Acutis's login response — never mock/placeholder data. */
export type AuthenticatedUser = Omit<StoredAcutisSession, 'token'>;

interface AuthContextValue {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthenticatedUser | null;
  signIn: (request: SignInRequest) => Promise<SignInResult>;
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
  const [session, setSession] = useState<StoredAcutisSession | null>(() => getStoredAcutisSession());
  const isAuthenticated = session !== null;

  useEffect(() => {
    const channel = sessionSync();
    const refreshSession = () => {
      if (environment.authMode !== 'sso') setSession(getStoredAcutisSession());
    };
    const onSignal = (event: MessageEvent<SessionSignal>) => {
      if (event.data === 'signed-out') setSession(null);
      else if (event.data === 'signed-in') setSession(getStoredAcutisSession());
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
    token: session?.token ?? null,
    user: session
      ? { userId: session.userId, email: session.email, firstName: session.firstName, lastName: session.lastName, fullName: session.fullName, isSuperUser: session.isSuperUser }
      : null,
    async signIn(request) {
      if (environment.authMode === 'sso') {
        return redirectToIdentityProvider(request) ? 'redirected' : 'unavailable';
      }

      if (!request.password) {
        return 'invalid-credentials';
      }

      try {
        const loggedInUser = await acutisLogin(request.email, request.password);
        const newSession: StoredAcutisSession = {
          token: loggedInUser.token,
          userId: loggedInUser.userId,
          email: loggedInUser.email,
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          fullName: loggedInUser.fullName,
          isSuperUser: loggedInUser.isSuperUser,
        };
        storeAcutisSession(newSession);
        setSession(newSession);
        sessionSync()?.postMessage('signed-in');
        return 'authenticated';
      } catch (error) {
        // 401/400-shaped credential failures are the caller's problem to display; anything else
        // (network down, misconfigured base URL) is reported as the service being unavailable.
        if (error instanceof AcutisAuthApiError && (error.httpStatus === 400 || error.httpStatus === 401)) {
          return 'invalid-credentials';
        }
        return 'unavailable';
      }
    },
    signOut() {
      clearAcutisToken();
      setSession(null);
      sessionSync()?.postMessage('signed-out');
    },
  }), [isAuthenticated, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
