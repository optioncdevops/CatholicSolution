export type AppEnvironment = 'development' | 'staging' | 'production';
export type AuthMode = 'mock' | 'sso';

const rawMode = import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development';
const appMode = (['development', 'staging', 'production'].includes(rawMode) ? rawMode : 'development') as AppEnvironment;

/**
 * Mock authentication is a development-only affordance: it mints a local session from
 * browser storage and MUST NOT reach staging or production (specification §20).
 *
 * This resolves fail-closed. Only a development build can select `mock`, and only by
 * explicitly opting out of `sso`. Any other build — including one whose `VITE_AUTH_MODE`
 * is missing, misspelled, or wrongly set to `mock` — resolves to `sso`, so a
 * configuration mistake degrades into "cannot sign in" rather than "anyone is signed in".
 */
const authMode: AuthMode = appMode === 'development' && import.meta.env.VITE_AUTH_MODE !== 'sso' ? 'mock' : 'sso';

export const environment = {
  mode: appMode,
  appId: import.meta.env.VITE_APP_ID || 'platform',
  basePath: import.meta.env.VITE_BASE_PATH || '/',
  domainRouting: import.meta.env.VITE_ENABLE_DOMAIN_ROUTING !== 'false',
  authMode,
  loginOrigin: import.meta.env.VITE_LOGIN_ORIGIN || import.meta.env.VITE_PLATFORM_ORIGIN || '',
  authOrigin: import.meta.env.VITE_AUTH_ORIGIN || '',
  origins: {
    platform: import.meta.env.VITE_PLATFORM_ORIGIN || '',
    optioncSchool: import.meta.env.VITE_OPTIONC_SCHOOL_ORIGIN || '',
    mattMoney: import.meta.env.VITE_MATT_MONEY_ORIGIN || '',
    arcAlerts: import.meta.env.VITE_ARC_ALERTS_ORIGIN || '',
    optioncParish: import.meta.env.VITE_OPTIONC_PARISH_ORIGIN || '',
    catholicContent: import.meta.env.VITE_CATHOLIC_CONTENT_ORIGIN || '',
    unifiedDirectory: import.meta.env.VITE_UNIFIED_DIRECTORY_ORIGIN || '',
    supportCenter: import.meta.env.VITE_SUPPORT_CENTER_ORIGIN || '',
  },
} as const;

export function isConfiguredOrigin(value: string) {
  return Boolean(value?.trim());
}
