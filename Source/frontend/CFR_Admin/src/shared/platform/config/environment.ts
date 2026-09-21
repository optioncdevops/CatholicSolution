export type AppEnvironment = 'development' | 'pilot' | 'staging' | 'live';

const APP_ENVIRONMENTS: readonly AppEnvironment[] = ['development', 'pilot', 'staging', 'live'];

function resolveAppEnvironment(): AppEnvironment {
  const mode = import.meta.env.MODE;
  if (APP_ENVIRONMENTS.includes(mode as AppEnvironment)) {
    return mode as AppEnvironment;
  }
  throw new Error(`Unsupported Vite mode "${mode}". Use development, pilot, staging, or live.`);
}

const mode: AppEnvironment = resolveAppEnvironment();

export const environment = {
  mode,
  deploymentTarget: mode,
  appId: 'cfr-admin',
  basePath: '/',
  sessionCookieDomain: import.meta.env.VITE_SESSION_COOKIE_DOMAIN?.trim() || undefined,
} as const;
