import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerForbiddenHandler, registerUnauthorizedHandler } from '@/lib/httpClient';
import { isJwtExpired } from '@/lib/jwt';
import { acutisAuthApi } from '../api';
import { ACUTIS_AUTH_STORAGE_KEY } from '../constants/storageKeys';
import { AuthContext, type AuthState } from './AuthContext';

const emptyState: AuthState = { user: null, token: null, moduleRights: [], menuItems: [] };

function readStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(ACUTIS_AUTH_STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed.token || isJwtExpired(parsed.token)) {
      // Present but expired — do not resurrect a dead session, but don't treat it as "never
      // logged in" either; the caller decides what to show based on isAuthenticated being false.
      return emptyState;
    }
    return parsed;
  } catch {
    return emptyState;
  }
}

function persistAuth(state: AuthState): void {
  if (state.token) {
    localStorage.setItem(ACUTIS_AUTH_STORAGE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(ACUTIS_AUTH_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(emptyState);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore session on application startup (Task 9 rule).
  useEffect(() => {
    setState(readStoredAuth());
    setIsInitializing(false);
  }, []);

  // Wire the shared 401 handler once — any API call anywhere in the app that gets a 401 clears
  // the session and routes to Session Expired, without every call site needing to know that.
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      persistAuth(emptyState);
      setState(emptyState);
      navigate('/auth/session-expired', { replace: true });
    });
  }, [navigate]);

  // 403 means the caller IS authenticated but not permitted — unlike 401, the session itself is
  // still valid, so only redirect; never clear state (that would incorrectly force a re-login).
  useEffect(() => {
    registerForbiddenHandler(() => {
      navigate('/unauthorized', { replace: true });
    });
  }, [navigate]);

  const login = (next: AuthState): void => {
    persistAuth(next);
    setState(next);
  };

  const logout = async (): Promise<void> => {
    const token = state.token;
    persistAuth(emptyState);
    setState(emptyState);
    if (token) {
      try {
        await acutisAuthApi.logout(token);
      } catch {
        // Logout is best-effort server-side (stateless JWT — see
        // docs/acutis-auth-spec/reference-comparison.md §2); the client-side session is already
        // cleared above regardless of whether this call succeeds.
      }
    }
    navigate('/auth/login', { replace: true });
  };

  const hasPermission = (moduleName: string): boolean =>
    state.moduleRights.some((right) => right.moduleName === moduleName);

  const isAuthenticated = !!state.token && !isJwtExpired(state.token);

  const value = useMemo(
    () => ({ ...state, isAuthenticated, isInitializing, login, logout, hasPermission }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, isAuthenticated, isInitializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
