import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { environment } from '@shared/platform/config/environment';
import { consumeDevelopmentAuthCallback } from './centralAuth';

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

interface StoredSession {
  appId: string;
  email: string;
  authenticatedAt: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const sessionKey = `catholic-solutions.auth.${environment.appId}.v1`;

/**
 * Same-origin session synchronisation channel.
 *
 * Launching apps into new tabs means several tabs of one solution can share a session, so
 * signing out in one has to end it in the others. A tab that keeps stale `isAuthenticated`
 * state would carry on rendering protected content until it happened to reload.
 *
 * This covers tabs of the *same* origin only. Propagating sign-out to other solution
 * domains is cross-origin and cannot be done from client script; it requires the identity
 * provider's front-channel or back-channel logout (see specification §20).
 */
const sessionChannelName = `${sessionKey}.sync`;
type SessionSignal = 'signed-in' | 'signed-out';
let sessionChannel: BroadcastChannel | null = null;

function sessionSync() {
  if (typeof BroadcastChannel === 'undefined') return null;
  sessionChannel ??= new BroadcastChannel(sessionChannelName);
  return sessionChannel;
}

function broadcastSession(signal: SessionSignal) {
  sessionSync()?.postMessage(signal);
}

function hasStoredSession() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem(sessionKey) || window.sessionStorage.getItem(sessionKey));
}

function storeSession(email: string, remember: boolean) {
  const session: StoredSession = {
    appId: environment.appId,
    email,
    authenticatedAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify(session);
  const primary = remember ? window.localStorage : window.sessionStorage;
  const secondary = remember ? window.sessionStorage : window.localStorage;
  secondary.removeItem(sessionKey);
  primary.setItem(sessionKey, serialized);
}

function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(sessionKey);
  window.sessionStorage.removeItem(sessionKey);
}

function bootstrapAuthentication() {
  if (hasStoredSession()) return true;
  const callbackMode = consumeDevelopmentAuthCallback();
  if (!callbackMode) return false;
  storeSession('carl.lapp@optionc.com', callbackMode === 'local');
  return true;
}

function redirectToIdentityProvider(request: SignInRequest) {
  if (!environment.authOrigin || typeof window === 'undefined') return false;
  const authUrl = new URL('/login', environment.authOrigin);
  authUrl.searchParams.set('client_id', request.clientId || environment.appId);
  authUrl.searchParams.set('returnUrl', request.returnUrl || window.location.href);
  if (request.provider && request.provider !== 'password') authUrl.searchParams.set('provider', request.provider);
  window.location.assign(authUrl.toString());
  return true;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setAuthenticated] = useState(bootstrapAuthentication);

  useEffect(() => {
    const channel = sessionSync();
    const onSignal = (event: MessageEvent<SessionSignal>) => {
      if (event.data === 'signed-out') setAuthenticated(false);
      else if (event.data === 'signed-in') setAuthenticated(true);
    };

    // Covers browsers without BroadcastChannel, and tabs that were already open. Fires
    // only for localStorage; a `null` key means the whole store was cleared.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== sessionKey) return;
      setAuthenticated(hasStoredSession());
    };

    channel?.addEventListener('message', onSignal);
    window.addEventListener('storage', onStorage);
    return () => {
      // The channel is a module-level singleton shared by the whole app, so remove the
      // listener but leave it open.
      channel?.removeEventListener('message', onSignal);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated,
    async signIn(request) {
      if (environment.authMode === 'sso') {
        return redirectToIdentityProvider(request) ? 'redirected' : 'unavailable';
      }
      storeSession(request.email || 'demo@catholicsolutions.local', Boolean(request.remember));
      setAuthenticated(true);
      broadcastSession('signed-in');
      return 'authenticated';
    },
    signOut() {
      clearSession();
      setAuthenticated(false);
      broadcastSession('signed-out');
    },
  }), [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
