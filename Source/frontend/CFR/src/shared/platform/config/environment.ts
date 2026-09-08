import { getAppAuthConfig, type ConfiguredAuthMode, type RuntimeEnvironment } from '@shared/auth/appAuthConfig';

export type AppEnvironment = RuntimeEnvironment;
export type AuthMode = ConfiguredAuthMode;

const APP_ENVIRONMENTS: readonly AppEnvironment[] = ['development', 'pilot', 'staging', 'live'];

function resolveAppEnvironment(): AppEnvironment {
  const mode = import.meta.env.MODE;
  if (APP_ENVIRONMENTS.includes(mode as AppEnvironment)) {
    return mode as AppEnvironment;
  }
  throw new Error(`Unsupported Vite mode "${mode}". Use development, pilot, staging, or live.`);
}

const mode: AppEnvironment = resolveAppEnvironment();
const authConfig = getAppAuthConfig(mode);

/**
 * Authentication strategy is centralized with the domain matrix in appAuthConfig.
 * Product env files never carry auth/domain routing switches, so every hosted build
 * follows the same contract and a future IdP cutover remains a one-file change.
 */
const authMode: AuthMode = authConfig.authMode;

export const environment = {
  mode,
  deploymentTarget: mode,
  appId: 'platform',
  basePath: '/',
  domainRouting: true,
  authMode,
  loginOrigin: authConfig.loginOrigin,
  authOrigin: authConfig.authOrigin,
  sessionCookieDomain: authConfig.sessionCookieDomain,
  origins: authConfig.origins,
} as const;

export function isConfiguredOrigin(value: string) {
  return Boolean(value?.trim());
}
