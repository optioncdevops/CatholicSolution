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
