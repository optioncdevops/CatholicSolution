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
  return configs[mode];
}
