import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { ACUTIS_AUTH_CHANGED_EVENT } from '@shared/auth/constants/storageKeys';
import { getRoleName, getStoredAcutisAuth } from '@shared/auth/services/authService';

export interface CurrentUser {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
}

interface UserContextValue {
  user: CurrentUser;
  initials: string;
  firstName: string;
}

const DEFAULT_USER: CurrentUser = {
  firstName: 'Carl',
  lastName: 'Lapp',
  name: 'Carl Lapp',
  email: 'carl.lapp@optionc.com',
  roleId: 0,
  roleName: '',
};

function buildUser(firstName: string, lastName: string, email: string, roleId: number, roleName = ''): CurrentUser {
  const name = `${firstName} ${lastName}`.trim();
  return {
    firstName,
    lastName,
    name: name || DEFAULT_USER.name,
    email: email || DEFAULT_USER.email,
    roleId,
    roleName,
  };
}

// Reads from the stored Acutis JWT payload, kept fresh by authService.updateStoredAcutisUser
// whenever the Profile dialog saves a real change — there is no separate client-side "draft"
// of the user; the stored auth blob is the single source of truth. roleName is resolved
// separately (see the effect below) since the JWT only carries roleId.
function userFromAuth(): CurrentUser {
  const stored = getStoredAcutisAuth()?.resultData?.user;
  if (!stored) return DEFAULT_USER;
  return buildUser(stored.firstName ?? '', stored.lastName ?? '', stored.eMail ?? '', stored.roleId ?? 0);
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

  // Resolve the role name once per roleId (e.g. "Administrator") for display in the account
  // menu. Best-effort: getRoleName never throws, so a lookup failure just leaves roleName empty
  // and the UI falls back to a generic label.
  useEffect(() => {
    if (!user.roleId || user.roleName) return undefined;
    let cancelled = false;
    void (async () => {
      const roleName = await getRoleName(user.roleId);
      if (cancelled || !roleName) return;
      setUser((current) => (current.roleId === user.roleId ? { ...current, roleName } : current));
    })();
    return () => {
      cancelled = true;
    };
  }, [user.roleId, user.roleName]);

  const value = useMemo<UserContextValue>(() => ({
    user,
    initials: getInitials(user.name),
    firstName: user.firstName || 'there',
  }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useCurrentUser must be used within UserProvider');
  return context;
}
