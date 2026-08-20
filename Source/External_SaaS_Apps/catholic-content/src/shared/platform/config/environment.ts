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

export const environment = {
  mode,
  deploymentTarget,
  appId: import.meta.env.VITE_APP_ID || 'platform',
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
