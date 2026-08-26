import type {
  AcutisChangePasswordRequest,
  AcutisCurrentUser,
  AcutisLoginRequest,
  AcutisLoginResult,
  AcutisMenuGroup,
} from '../types';
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

  async resetPassword(): Promise<void> {
    await delay(200);
    throw new ApiError('This reset link is invalid or has expired.', 400, 203);
  },

  async getMenus(token: string, cachedMenuItems: AcutisMenuGroup[]): Promise<AcutisMenuGroup[]> {
    await delay(50);
    if (token !== MOCK_TOKEN) throw new ApiError('Unauthorized', 401);
    return cachedMenuItems;
  },
};
