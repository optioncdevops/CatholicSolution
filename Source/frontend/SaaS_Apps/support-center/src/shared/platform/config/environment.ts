import { getAppAuthConfig, type ConfiguredAuthMode, type RuntimeEnvironment } from '@shared/auth/appAuthConfig';

export type AppEnvironment = RuntimeEnvironment;
export type AuthMode = ConfiguredAuthMode;

const mode: AppEnvironment = import.meta.env.MODE === 'development' ? 'development' : 'production';
const deploymentTarget = mode === 'development'
  ? 'development'
  : import.meta.env.VITE_DEPLOYMENT_TARGET === 'staging' ? 'staging' : 'production';
const authConfig = getAppAuthConfig(mode);

/**
 * Authentication strategy is centralized with the domain matrix in appAuthConfig.
 * Product env files never carry auth/domain routing switches, so every hosted build
 * follows the same contract and a future IdP cutover remains a one-file change.
 */
const authMode: AuthMode = authConfig.authMode;

/**
 * VITE_APP_ID identifies this build to the App Switcher and App Hub. A missing value
 * must never silently resolve to a shared default id — that would misattribute this
 * app's identity to another product. Only local development gets a clearly-marked,
 * loudly-logged fallback; production fails fast instead.
 */
function resolveAppId(): string {
  const raw = import.meta.env.VITE_APP_ID?.trim();
  if (raw) return raw;
  if (mode === 'development') {
    console.warn('[environment] VITE_APP_ID is not set. Using "dev-unconfigured-app" for local development only — set VITE_APP_ID before deploying.');
    return 'dev-unconfigured-app';
  }
  throw new Error('VITE_APP_ID is required and must not be empty in a production build. Refusing to silently fall back to a default app id.');
}

export const environment = {
  mode,
  deploymentTarget,
  appId: resolveAppId(),
  basePath: import.meta.env.VITE_BASE_PATH || '/',
  domainRouting: import.meta.env.VITE_ENABLE_DOMAIN_ROUTING !== 'false',
  authMode,
  loginOrigin: authConfig.loginOrigin,
  authOrigin: authConfig.authOrigin,
  sessionCookieDomain: authConfig.sessionCookieDomain,
  origins: authConfig.origins,
} as const;

export function isConfiguredOrigin(value: string) {
  return Boolean(value?.trim());
}
