export type RuntimeEnvironment = 'development' | 'production';

export interface SolutionOrigins {
  platform: string;
  optioncSchool: string;
  mattMoney: string;
  arcAlerts: string;
  optioncParish: string;
  catholicContent: string;
  unifiedDirectory: string;
  supportCenter: string;
}

interface AppAuthConfig {
  loginOrigin: string;
  authOrigin: string;
  sessionCookieDomain?: string;
  origins: SolutionOrigins;
}

const developmentOrigins: SolutionOrigins = {
  platform: 'http://localhost:4001',
  optioncSchool: 'http://localhost:4002',
  mattMoney: 'http://localhost:4003',
  arcAlerts: 'http://localhost:4004',
  optioncParish: 'http://localhost:4005',
  catholicContent: 'http://localhost:4006',
  unifiedDirectory: 'http://localhost:4007',
  supportCenter: 'http://localhost:4009',
};

const productionOrigins: SolutionOrigins = {
  platform: 'https://cfr.optioncapp.com',
  optioncSchool: 'https://optionc-sms.optioncapp.com',
  mattMoney: 'https://matt-money.optioncapp.com',
  arcAlerts: 'https://arc-alerts.optioncapp.com',
  optioncParish: 'https://optionc-parish.optioncapp.com',
  catholicContent: 'https://catholic-content.optioncapp.com',
  unifiedDirectory: 'https://directory.optioncapp.com',
  supportCenter: 'https://support-center.optioncapp.com',
};

const configs: Record<RuntimeEnvironment, AppAuthConfig> = {
  development: {
    loginOrigin: developmentOrigins.platform,
    authOrigin: developmentOrigins.platform,
    origins: developmentOrigins,
  },
  production: {
    loginOrigin: productionOrigins.platform,
    authOrigin: productionOrigins.platform,
    sessionCookieDomain: '.optioncapp.com',
    origins: productionOrigins,
  },
};

export function getAppAuthConfig(mode: RuntimeEnvironment) {
  return configs[mode];
}
