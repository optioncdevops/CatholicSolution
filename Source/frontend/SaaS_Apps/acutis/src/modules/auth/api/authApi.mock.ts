import type {
  AcutisChangePasswordRequest,
  AcutisCurrentUser,
  AcutisLoginRequest,
  AcutisLoginResult,
  AcutisMenuGroup,
  AcutisResetPasswordRequest,
} from '../types';
import { isPasswordPolicyCompliant, PASSWORD_POLICY_DESCRIPTION } from '../validation';
import { ApiError, type AcutisAuthApi } from './authApi';

/**
 * Mock adapter — no network calls at all. Mirrors the backend's DEV FAKE repository behavior
 * exactly (same one hardcoded credential pair, same "not supported" blockers for password
 * change/reset) so switching VITE_ACUTIS_AUTH_MODE between mock/api changes nothing observable
 * about *behavior*, only whether real HTTP requests happen.
 */
const MOCK_EMAIL = 'dev.acutis@example.test';
const MOCK_PASSWORD = 'DevOnly!NotARealPassword';
const MOCK_TOKEN = 'mock.acutis.token';

const mockMenuItems: AcutisMenuGroup[] = [
  {
    title: 'Dashboard',
    icon: '',
    sessionKey: 'Dashboard',
    path: '/dashboard',
    links: [],
    btnlinks: [],
    activity: [],
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAcutisAuthApi: AcutisAuthApi = {
  async login(request: AcutisLoginRequest): Promise<AcutisLoginResult> {
    await delay(300);
    if (request.userName !== MOCK_EMAIL || request.password !== MOCK_PASSWORD) {
      throw new ApiError('Invalid username or password.', 400, 203);
    }
    return {
      user: {
        userId: 1,
        email: MOCK_EMAIL,
        firstName: 'Dev',
        lastName: 'Fake',
        fullName: 'Dev Fake',
        token: MOCK_TOKEN,
      },
      moduleRights: [{ moduleName: 'Dashboard', userRight: 1, roleId: 1 }],
      menuItems: mockMenuItems,
    };
  },

  async getCurrentUser(token: string): Promise<AcutisCurrentUser> {
    await delay(150);
    if (token !== MOCK_TOKEN) {
      throw new ApiError('Unauthorized', 401);
    }
    return { userId: 1, email: MOCK_EMAIL, fullName: 'Dev Fake' };
  },

  async logout(): Promise<void> {
    await delay(100);
  },

  async changePassword(token: string, request: AcutisChangePasswordRequest): Promise<void> {
    await delay(200);
    if (token !== MOCK_TOKEN) throw new ApiError('Unauthorized', 401);
    // Same validation order as AcutisAuthenticationService.ChangePasswordAsync — see
    // docs/acutis-auth-spec/validation-standard.md — so mock mode is never more permissive than
    // the real backend for a given input.
    if (request.newPassword !== request.confirmPassword) {
      throw new ApiError('New password and confirmation do not match.', 400, 400);
    }
    if (request.currentPassword === request.newPassword) {
      throw new ApiError('New password must be different from the current password.', 400, 400);
    }
    if (!isPasswordPolicyCompliant(request.newPassword)) {
      throw new ApiError(PASSWORD_POLICY_DESCRIPTION, 400, 400);
    }
    if (request.currentPassword !== MOCK_PASSWORD) {
      throw new ApiError('Current password is incorrect.', 400, 203);
    }
    throw new ApiError(
      'This operation is not yet supported — no confirmed database connection exists for Acutis authentication yet.',
      400,
      203,
    );
  },

  async forgotPassword(): Promise<void> {
    await delay(200);
    // Always succeeds with a generic outcome — enumeration-safe, matches the real backend.
  },

  async resetPassword(request: AcutisResetPasswordRequest): Promise<void> {
    await delay(200);
    // Same validation order as AcutisAuthenticationService.ResetPasswordAsync — see
    // docs/acutis-auth-spec/validation-standard.md.
    if (request.newPassword !== request.confirmPassword) {
      throw new ApiError('New password and confirmation do not match.', 400, 400);
    }
    if (!isPasswordPolicyCompliant(request.newPassword)) {
      throw new ApiError(PASSWORD_POLICY_DESCRIPTION, 400, 400);
    }
    // No real reset-token store exists in mock mode either — every plausible-looking token still
    // reports the same generic invalid/expired failure, matching the real backend's DEV-mode
    // behavior (no token was ever actually issued to be redeemed).
    throw new ApiError('This reset link is invalid or has expired.', 400, 203);
  },

  async getMenus(token: string, cachedMenuItems: AcutisMenuGroup[]): Promise<AcutisMenuGroup[]> {
    await delay(50);
    if (token !== MOCK_TOKEN) throw new ApiError('Unauthorized', 401);
    return cachedMenuItems;
  },
};
