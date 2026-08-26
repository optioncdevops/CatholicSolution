import { createContext } from 'react';
import type { AcutisLoginUser, AcutisMenuGroup, AcutisModuleRight } from '../types';

export interface AuthState {
  user: AcutisLoginUser | null;
  token: string | null;
  moduleRights: AcutisModuleRight[];
  menuItems: AcutisMenuGroup[];
}

export interface AuthContextValue extends AuthState {
  /** True only when a token is present AND not expired — see docs/acutis-auth-spec/frontend-design.md. */
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (state: AuthState) => void;
  logout: () => Promise<void>;
  hasPermission: (moduleName: string) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
