export type RuntimeEnvironment = 'development' | 'pilot' | 'staging' | 'live';
export type ConfiguredAuthMode = 'mock' | 'preview' | 'sso';

export interface PlatformOrigins {
  platform: string;
  platformAdmin: string;
}

interface AppAuthConfig {
  authMode: ConfiguredAuthMode;
  loginOrigin: string;
  authOrigin: string;
  sessionCookieDomain?: string;
  origins: PlatformOrigins;
}

const developmentOrigins: PlatformOrigins = {
  platform: 'http://localhost:4001',
  platformAdmin: 'http://localhost:4011',
};

const hostedOrigins: PlatformOrigins = {
  platform: 'https://cfr.optioncapp.com',
  platformAdmin: 'https://admin.optioncapp.com',
};

const hostedConfig: AppAuthConfig = {
  authMode: 'preview',
  loginOrigin: hostedOrigins.platform,
  authOrigin: hostedOrigins.platform,
  origins: hostedOrigins,
};

const configs: Record<RuntimeEnvironment, AppAuthConfig> = {
  development: {
    authMode: 'mock',
    loginOrigin: developmentOrigins.platform,
    authOrigin: developmentOrigins.platform,
    origins: developmentOrigins,
  },
  pilot: hostedConfig,
  staging: hostedConfig,
  live: hostedConfig,
};

export function getAppAuthConfig(mode: RuntimeEnvironment) {
  const config = configs[mode];
  if (mode !== 'development' && config.authMode !== 'sso') {
    console.warn(
      `[cfr] ${mode} build is configured with authMode "${config.authMode}", not "sso". ` +
        'This is expected for the current prototype phase (mocked auth only) — do not treat this build as production-ready.',
    );
  }
  return config;
}
