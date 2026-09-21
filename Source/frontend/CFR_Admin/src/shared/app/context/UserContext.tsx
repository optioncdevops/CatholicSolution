import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { ACUTIS_AUTH_CHANGED_EVENT } from '@/modules/authentication/utils/storageKeys';
import { getRoleName, getStoredAcutisAuth } from '@/modules/authentication/services/authService';

export interface CurrentUser {
  userId: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  profileImageUrl: string | null;
  status: string;
  lastActiveAt: string | null;
}

interface UserContextValue {
  user: CurrentUser;
  initials: string;
  firstName: string;
}

function buildUser(fields: {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  profileImageUrl: string | null;
  status: string;
  lastActiveAt: string | null;
  roleName?: string;
}): CurrentUser {
  return {
    userId: fields.userId,
    firstName: fields.firstName,
    lastName: fields.lastName,
    name: `${fields.firstName} ${fields.lastName}`.trim(),
    email: fields.email,
    roleId: fields.roleId,
    roleName: fields.roleName ?? '',
    profileImageUrl: fields.profileImageUrl,
    status: fields.status,
    lastActiveAt: fields.lastActiveAt,
  };
}

const EMPTY_USER: CurrentUser = {
  userId: 0,
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  roleId: 0,
  roleName: '',
  profileImageUrl: null,
  status: '',
  lastActiveAt: null,
};

// Reads from the stored Acutis JWT payload, kept fresh by authService.updateStoredAcutisUser
// whenever the Profile page saves a real change — there is no separate client-side "draft"
// of the user; the stored auth blob is the single source of truth. roleName is resolved
// separately (see the effect below) since the JWT only carries roleId.
function userFromAuth(): CurrentUser {
  const stored = getStoredAcutisAuth()?.resultData?.user;
  if (!stored) return EMPTY_USER;
  return buildUser({
    userId: stored.userId ?? 0,
    firstName: stored.firstName ?? '',
    lastName: stored.lastName ?? '',
    email: stored.eMail ?? '',
    roleId: stored.roleId ?? 0,
    profileImageUrl: stored.profileImageUrl ?? null,
    status: stored.status ?? '',
    lastActiveAt: stored.lastActiveAt ?? null,
  });
}

const UserContext = createContext<UserContextValue | null>(null);

function getInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase();
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
