import { postPortalApi, setPortalSession, type PortalSessionUser } from '@app/config/appPortalClient';
import type { PortalLoginUser } from '../types/authenticationTypes';

const controller = 'PortalLogin';

export const loginPortal = async (userName: string, password: string): Promise<PortalSessionUser> => {
  const response = await postPortalApi(`${controller}/LoginAuthentication`, { userName, password });
  const statusCode = Number(response.statusCode ?? 200);
  if (statusCode >= 400) {
    throw String(response.statusMessage || 'Invalid email or password.');
  }

  const payload = (response.resultData ?? {}) as Record<string, unknown>;
  const user = ((payload.user ?? payload.User ?? payload) as PortalLoginUser) ?? {};
  const token = String(user.token ?? '').trim();
  const eMail = String(user.eMail ?? userName).trim();
  const userId = Number(user.userId ?? 0);
  if (!token || userId <= 0) {
    throw 'Invalid email or password.';
  }

  const sessionUser: PortalSessionUser = {
    userId,
    eMail,
    firstName: String(user.firstName ?? '').trim(),
    lastName: String(user.lastName ?? '').trim(),
  };
  setPortalSession(token, sessionUser);
  return sessionUser;
};

/**
 * Exchanges a one-time App Hub platform-launch code (see PlatformLaunchController) for a real
 * Portal session - the same response shape as loginPortal(), just reached via a code instead of
 * a password. Persists the session the same way; the caller still needs to call
 * useAuth().establishSession() to flip this tab's isAuthenticated flag.
 */
export const exchangePlatformToken = async (code: string): Promise<PortalSessionUser> => {
  const response = await postPortalApi('PlatformLaunch/ExchangeToken', { code });
  const statusCode = Number(response.statusCode ?? 200);
  if (statusCode >= 400) {
    throw String(response.statusMessage || 'Unable to complete sign-in.');
  }

  const payload = (response.resultData ?? {}) as Record<string, unknown>;
  const user = ((payload.user ?? payload.User ?? payload) as PortalLoginUser) ?? {};
  const token = String(user.token ?? '').trim();
  const eMail = String(user.eMail ?? '').trim();
  const userId = Number(user.userId ?? 0);
  if (!token || userId <= 0) {
    throw 'Unable to complete sign-in.';
  }

  const sessionUser: PortalSessionUser = {
    userId,
    eMail,
    firstName: String(user.firstName ?? '').trim(),
    lastName: String(user.lastName ?? '').trim(),
  };
  setPortalSession(token, sessionUser);
  return sessionUser;
};
