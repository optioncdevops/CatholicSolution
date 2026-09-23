import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { getPortalSessionUser } from '@app/config/appPortalClient';
import { useAuth } from '@/modules/authentication';

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

const UserContext = createContext<UserContextValue | null>(null);

function getInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase();
}

function readSessionUser(): CurrentUser {
  const session = getPortalSessionUser();
  if (!session?.eMail) return { name: '', email: '', phone: '' };
  const name = `${session.firstName} ${session.lastName}`.trim() || session.eMail;
  return { name, email: session.eMail, phone: '' };
}

export function UserProvider({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState(readSessionUser);
  const [syncedFor, setSyncedFor] = useState(isAuthenticated);

  // UserProvider mounts once near the app root, well before a session established later on -
  // e.g. a platform-launch code exchange deep inside ProductLaunchPage, or the cross-tab
  // BroadcastChannel picking up another tab's sign-in - ever writes sessionStorage. Without this,
  // that initial (empty) read never gets revisited and the header/profile stay blank until a
  // full page reload remounts this provider fresh. Adjusted during render (React's documented
  // pattern for this - https://react.dev/learn/you-might-not-need-an-effect), not in an effect,
  // so it takes effect before the first paint instead of after.
  if (isAuthenticated !== syncedFor) {
    setSyncedFor(isAuthenticated);
    if (isAuthenticated) setUser(readSessionUser());
  }

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
