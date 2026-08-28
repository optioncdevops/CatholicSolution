import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { ACUTIS_AUTH_CHANGED_EVENT } from '@shared/auth/constants/storageKeys';
import { getStoredAcutisAuth } from '@shared/auth/services/authService';

export interface CurrentUser {
  name: string;
  email: string;
  phone: string;
}

interface UserContextValue {
  user: CurrentUser;
  initials: string;
  firstName: string;
  updateUser: (updates: Pick<CurrentUser, 'name' | 'email' | 'phone'>) => void;
}

const DEFAULT_USER: CurrentUser = {
  name: 'Carl Lapp',
  email: 'carl.lapp@optionc.com',
  phone: '(555) 214-7788',
};

function userFromAuth(): CurrentUser {
  const stored = getStoredAcutisAuth()?.resultData?.user;
  if (!stored) return DEFAULT_USER;
  const name = stored.fullName?.trim() || `${stored.firstName ?? ''} ${stored.lastName ?? ''}`.trim();
  return {
    name: name || DEFAULT_USER.name,
    email: stored.eMail || DEFAULT_USER.email,
    phone: DEFAULT_USER.phone,
  };
}

const UserContext = createContext<UserContextValue | null>(null);

function getInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase() || 'CL';
}

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState(userFromAuth);

  useEffect(() => {
    const refresh = () => setUser(userFromAuth());
    window.addEventListener(ACUTIS_AUTH_CHANGED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(ACUTIS_AUTH_CHANGED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
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
