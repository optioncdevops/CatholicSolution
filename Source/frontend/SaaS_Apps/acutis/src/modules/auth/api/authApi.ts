import type {
  AcutisChangePasswordRequest,
  AcutisCurrentUser,
  AcutisForgotPasswordRequest,
  AcutisLoginRequest,
  AcutisLoginResult,
  AcutisMenuGroup,
  AcutisResetPasswordRequest,
} from '../types';

/**
 * A normal (non-2xx) API response, thrown by both the mock and real adapters so callers have one
 * shape to handle regardless of mode. `status` is the domain MSResultArgs.statusCode where known
 * (e.g. 203 for a generic auth failure), not necessarily the HTTP status code.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly domainStatusCode?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Typed adapter for every Acutis auth endpoint this frontend integrates with. Exactly one
 * implementation is active at a time, selected by VITE_ACUTIS_AUTH_MODE — see ./index.ts. UI
 * components depend only on this interface, never on axios/fetch/mock details directly, so
 * switching modes never requires touching a component.
 */
export interface AcutisAuthApi {
  login(request: AcutisLoginRequest): Promise<AcutisLoginResult>;
  getCurrentUser(token: string): Promise<AcutisCurrentUser>;
  logout(token: string): Promise<void>;
  changePassword(token: string, request: AcutisChangePasswordRequest): Promise<void>;
  forgotPassword(request: AcutisForgotPasswordRequest): Promise<void>;
  resetPassword(request: AcutisResetPasswordRequest): Promise<void>;
  /**
   * `GET /navigation/menus` (Task 14) — the real adapter now calls it. `cachedMenuItems` (the
   * tree captured at last login) is passed as a fallback shape for the mock adapter, which has no
   * live backend to call; the real adapter ignores it and returns the server's current answer.
   */
  getMenus(token: string, cachedMenuItems: AcutisMenuGroup[]): Promise<AcutisMenuGroup[]>;
}
