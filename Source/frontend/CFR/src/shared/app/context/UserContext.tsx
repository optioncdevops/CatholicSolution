import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

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
  name: 'Sherlina',
  email: 'sherlina@dbcyelagiri.edu.in',
  phone: '(555) 214-7788',
};

const UserContext = createContext<UserContextValue | null>(null);

function getInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase() || 'CL';
}

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState(DEFAULT_USER);
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
