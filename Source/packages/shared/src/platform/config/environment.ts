import { getAppAuthConfig, type RuntimeEnvironment } from '@shared/auth/appAuthConfig';

export type AppEnvironment = RuntimeEnvironment;
export type AuthMode = 'mock' | 'preview' | 'sso';

const mode: AppEnvironment = import.meta.env.MODE === 'development' ? 'development' : 'production';
const deploymentTarget = mode === 'development'
  ? 'development'
  : import.meta.env.VITE_DEPLOYMENT_TARGET === 'staging' ? 'staging' : 'production';
const authConfig = getAppAuthConfig(mode);

/**
 * Development and staging builds use the frontend-only central-session adapter so the
 * multi-domain prototype can be exercised without an identity backend. Production is
 * fail-closed and must use a real identity provider before credentials are accepted.
 */
const authMode: AuthMode = mode === 'development' ? 'mock' : deploymentTarget === 'staging' ? 'preview' : 'sso';

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
