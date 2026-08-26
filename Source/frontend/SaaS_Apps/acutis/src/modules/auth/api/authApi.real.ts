import { apiRequest } from '@/lib/httpClient';
import type {
  AcutisChangePasswordRequest,
  AcutisCurrentUser,
  AcutisForgotPasswordRequest,
  AcutisLoginRequest,
  AcutisLoginResult,
  AcutisMenuGroup,
  AcutisResetPasswordRequest,
} from '../types';
import type { AcutisAuthApi } from './authApi';

/**
 * Real adapter — calls the seven endpoints in docs/acutis-auth-spec/api-contract.md via
 * VITE_APP_REST_API_BASE_URL (either CFR.Gateway's /acutis prefix or CFR.Acutis directly). Only
 * the DEV FAKE repository backs the server side of these calls today — see
 * docs/acutis-auth-spec/database-contract.md.
 */
export const realAcutisAuthApi: AcutisAuthApi = {
  login(request: AcutisLoginRequest): Promise<AcutisLoginResult> {
    return apiRequest<AcutisLoginResult>('/Auth/Login', { method: 'POST', body: request });
  },

  getCurrentUser(token: string): Promise<AcutisCurrentUser> {
    return apiRequest<AcutisCurrentUser>('/Auth/Me', { method: 'GET', token });
  },

  async logout(token: string): Promise<void> {
    await apiRequest<null>('/Auth/Logout', { method: 'POST', token });
  },

  async changePassword(token: string, request: AcutisChangePasswordRequest): Promise<void> {
    await apiRequest<null>('/Auth/ChangePassword', { method: 'POST', token, body: request });
  },

  async forgotPassword(request: AcutisForgotPasswordRequest): Promise<void> {
    await apiRequest<null>('/Auth/ForgotPassword', { method: 'POST', body: request });
  },

  async resetPassword(request: AcutisResetPasswordRequest): Promise<void> {
    await apiRequest<null>('/Auth/ResetPassword', { method: 'POST', body: request });
  },

  // GET /navigation/menus (CFR.Acutis NavigationController, added Task 14). cachedMenuItems is
  // unused here — it exists only so the mock adapter has a fallback shape to return.
  async getMenus(token: string): Promise<AcutisMenuGroup[]> {
    return apiRequest<AcutisMenuGroup[]>('/Navigation/Menus', { method: 'GET', token });
  },
};
