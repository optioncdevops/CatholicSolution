import { mockAcutisAuthApi } from './authApi.mock';
import { realAcutisAuthApi } from './authApi.real';
import type { AcutisAuthApi } from './authApi';

export type { AcutisAuthApi } from './authApi';
export { ApiError } from './authApi';

/**
 * The one place mock-vs-real is decided, driven by VITE_ACUTIS_AUTH_MODE. Every consumer
 * (AuthProvider, pages) imports `acutisAuthApi` from here and never imports either concrete
 * adapter directly, so flipping the env var is the entire migration from mock to real API mode —
 * no component changes required (Task 9 rule).
 */
export const acutisAuthApi: AcutisAuthApi =
  import.meta.env.VITE_ACUTIS_AUTH_MODE === 'api' ? realAcutisAuthApi : mockAcutisAuthApi;
