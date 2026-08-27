import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useAuth } from '@shared/auth/AuthProvider';

export interface CurrentUser {
  name: string;
  email: string;
  /** CFR.Acutis's login response carries no phone number — always empty until a real source exists. */
  phone: string;
}

interface UserContextValue {
  user: CurrentUser;
  initials: string;
  firstName: string;
  updateUser: (updates: Pick<CurrentUser, 'name' | 'email' | 'phone'>) => void;
}

const ANONYMOUS_USER: CurrentUser = { name: '', email: '', phone: '' };

const UserContext = createContext<UserContextValue | null>(null);

function getInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function deriveNameFromAuthenticatedUser(user: { fullName: string | null; firstName: string | null; lastName: string | null; email: string | null }) {
  if (user.fullName?.trim()) return user.fullName.trim();
  const composed = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (composed) return composed;
  return user.email?.trim() || '';
}

/**
 * Seeded from the real, authenticated Acutis user (see AuthProvider) — never a mock/placeholder
 * identity. Local edits via `updateUser` (the account-settings modal) only update this in-memory
 * copy; there is no confirmed backend "update profile" endpoint yet, so edits do not persist past
 * a page reload — this is an honest limitation, not silently pretended to be saved server-side.
 */
export function UserProvider({ children }: PropsWithChildren) {
  const { user: authenticatedUser } = useAuth();
  const [user, setUser] = useState<CurrentUser>(ANONYMOUS_USER);

  useEffect(() => {
    if (!authenticatedUser) {
      setUser(ANONYMOUS_USER);
      return;
    }
    setUser({
      name: deriveNameFromAuthenticatedUser(authenticatedUser),
      email: authenticatedUser.email?.trim() || '',
      phone: '',
    });
  }, [authenticatedUser]);

  const value = useMemo<UserContextValue>(() => ({
    user,
    initials: getInitials(user.name),
    firstName: user.name.trim().split(/\s+/)[0] || 'there',
    updateUser: (updates) => setUser((current) => ({ ...current, ...updates })),
  }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useCurrentUser must be used within UserProvider');
  return context;
}
