import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { environment } from '@shared/platform/config/environment';
import { clearPortalSession, getPortalToken } from '@app/config/appPortalClient';
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

// The preview cookie alone isn't enough - it's Path=/ and long-lived, so a brand new tab of
// this origin inherits it even though the actual bearer token lives only in that tab's own
// sessionStorage (never shared across tabs, and the cross-tab BroadcastChannel below only
// signals a boolean, not the token itself). Requiring both here means a token-less tab is
// correctly treated as signed out and sent to /login, instead of rendering as "authenticated"
// while every API call 401s.
function hasValidPortalSession() {
  return hasPreviewSession() && Boolean(getPortalToken());
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setAuthenticated] = useState(hasValidPortalSession);

  useEffect(() => {
    const channel = sessionSync();
    const refreshSession = () => {
      setAuthenticated(hasValidPortalSession());
    };
    const onSignal = (event: MessageEvent<SessionSignal>) => {
      // A peer tab's "signed-in" broadcast doesn't mean *this* tab has a token - re-check this
      // tab's own sessionStorage rather than trusting the signal outright.
      if (event.data === 'signed-out') setAuthenticated(false);
      else if (event.data === 'signed-in') refreshSession();
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
    establishSession() {
      createPreviewSession(true);
      setAuthenticated(true);
      sessionSync()?.postMessage('signed-in');
    },
  }), [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
