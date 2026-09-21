import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { environment } from '@shared/platform/config/environment';
import { clearPortalSession } from '@app/config/appPortalClient';
import { loginPortal } from '../services/portalAuthService';
import type { AuthContextValue } from '../types/authenticationTypes';
import { clearAuth0SessionFlag } from '../utils/auth0Session';
import { clearPreviewSession, createPreviewSession, hasPreviewSession } from '../utils/authenticationHelpers';

const AuthContext = createContext<AuthContextValue | null>(null);
const sessionChannelName = `catholic-solutions.auth.${environment.appId}.sync`;
type SessionSignal = 'signed-in' | 'signed-out';
let sessionChannel: BroadcastChannel | null = null;

function sessionSync() {
  if (typeof BroadcastChannel === 'undefined') return null;
  sessionChannel ??= new BroadcastChannel(sessionChannelName);
  return sessionChannel;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setAuthenticated] = useState(hasPreviewSession);

  useEffect(() => {
    const channel = sessionSync();
    const refreshSession = () => {
      setAuthenticated(hasPreviewSession());
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
      clearAuth0SessionFlag();
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
