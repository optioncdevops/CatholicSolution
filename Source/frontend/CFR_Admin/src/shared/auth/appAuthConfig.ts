/**
 * Domain/auth-mode routing for CFR Admin, read from the environment (VITE_PLATFORM_ORIGIN,
 * VITE_PLATFORM_ADMIN_ORIGIN, VITE_AUTH_MODE, VITE_SESSION_COOKIE_DOMAIN — see .env.development /
 * .env.pilot / .env.staging / .env.live). No origin/domain value is hardcoded in source: Vite
 * already loads the matching `.env.<mode>` file for the resolved build mode, so ops can repoint a
 * domain or flip an environment's auth mode by editing that file alone, no code change or redeploy
 * of app logic required. Fails fast at startup if a required variable is missing.
 *
 * frontend/CFR owns an equivalent copy at modules/authentication/utils/appAuthConfig.ts. The two
 * apps don't share a package (see frontend/CLAUDE.md's project-boundary rules), so keep both in
 * sync by hand when either changes — and keep their respective `.env.*` origin values matching,
 * since each app's PlatformLink/central-auth handoff points at the other.
 */
export type RuntimeEnvironment = 'development' | 'pilot' | 'staging' | 'live';
export type ConfiguredAuthMode = 'mock' | 'preview' | 'sso';

export interface PlatformOrigins {
  readonly platform: string;
  readonly platformAdmin: string;
}

interface AppAuthConfig {
  readonly authMode: ConfiguredAuthMode;
  readonly loginOrigin: string;
  readonly authOrigin: string;
  readonly sessionCookieDomain?: string;
  readonly origins: PlatformOrigins;
}

const AUTH_MODES: readonly ConfiguredAuthMode[] = ['mock', 'preview', 'sso'];

function isConfiguredAuthMode(value: string | undefined): value is ConfiguredAuthMode {
  return Boolean(value) && (AUTH_MODES as readonly string[]).includes(value as string);
}

function requireEnvVar(mode: RuntimeEnvironment, name: keyof ImportMetaEnv, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(
      `[cfr-admin] Missing required environment variable "${name}" for build mode "${mode}". ` +
        `Set it in .env.${mode}.`,
    );
  }
  return trimmed;
}

export function getAppAuthConfig(mode: RuntimeEnvironment): AppAuthConfig {
  const env = import.meta.env;

  const platform = requireEnvVar(mode, 'VITE_PLATFORM_ORIGIN', env.VITE_PLATFORM_ORIGIN);
  const platformAdmin = requireEnvVar(mode, 'VITE_PLATFORM_ADMIN_ORIGIN', env.VITE_PLATFORM_ADMIN_ORIGIN);

  if (!isConfiguredAuthMode(env.VITE_AUTH_MODE)) {
    throw new Error(
      `[cfr-admin] VITE_AUTH_MODE "${env.VITE_AUTH_MODE ?? ''}" in .env.${mode} is invalid — ` +
        `expected one of: ${AUTH_MODES.join(', ')}.`,
    );
  }
  const authMode = env.VITE_AUTH_MODE;

  if (mode !== 'development' && authMode !== 'sso') {
    console.warn(
      `[cfr-admin] ${mode} build is configured with authMode "${authMode}", not "sso". ` +
        'This is expected for the current prototype phase (mocked auth only) — do not treat this build as production-ready.',
    );
  }

  return {
    authMode,
    loginOrigin: platform,
    authOrigin: platform,
    sessionCookieDomain: env.VITE_SESSION_COOKIE_DOMAIN?.trim() || undefined,
    origins: { platform, platformAdmin },
  };
}
