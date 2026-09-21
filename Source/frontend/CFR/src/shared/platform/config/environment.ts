import type { RuntimeEnvironment } from '@/modules/authentication/types/authenticationTypes';

export type AppEnvironment = RuntimeEnvironment;

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
  appId: 'platform',
  basePath: '/',
  sessionCookieDomain: undefined as string | undefined,
} as const;
