export type RuntimeEnvironment = 'development' | 'production';
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

const productionOrigins: PlatformOrigins = {
  platform: 'https://cfr.optioncapp.com',
  platformAdmin: 'https://admin.optioncapp.com',
};

const configs: Record<RuntimeEnvironment, AppAuthConfig> = {
  development: {
    authMode: 'mock',
    loginOrigin: developmentOrigins.platform,
    authOrigin: developmentOrigins.platform,
    origins: developmentOrigins,
  },
  production: {
    // Preview auth remains host-scoped. Production federation should use the configured IdP.
    authMode: 'preview',
    loginOrigin: productionOrigins.platform,
    authOrigin: productionOrigins.platform,
    origins: productionOrigins,
  },
};

export function getAppAuthConfig(mode: RuntimeEnvironment) {
  const config = configs[mode];
  if (mode === 'production' && config.authMode !== 'sso') {
    // This is currently a non-functional prototype — warn loudly instead of throwing, so
    // a production build stays reviewable. Wiring a real IdP and restoring the hard
    // failure is required before this app handles real users.
    console.warn(
      `[cfr] Production build is configured with authMode "${config.authMode}", not "sso". ` +
        'This is expected for the current prototype phase (mocked auth only) — do not treat this build as production-ready.',
    );
  }
  return config;
}
