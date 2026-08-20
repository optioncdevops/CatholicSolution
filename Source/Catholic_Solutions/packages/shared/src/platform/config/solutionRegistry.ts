import { environment } from './environment';

export type SolutionId = 'platform' | 'platform-admin';

export interface SolutionConfig {
  id: SolutionId;
  name: string;
  category: string;
  route: string;
  origin: string;
  favicon: string;
  themeColor: string;
  title: string;
}

/** Only CFR and the Super Admin console are deployable applications owned by this repository. */
export const SOLUTION_REGISTRY: Record<SolutionId, SolutionConfig> = {
  platform: {
    id: 'platform',
    name: 'Catholic Solutions',
    category: 'CFR End-user Portal',
    route: '/apps',
    origin: environment.origins.platform,
    favicon: '/favicon.svg',
    themeColor: '#12264c',
    title: 'Catholic Solutions',
  },
  'platform-admin': {
    id: 'platform-admin',
    name: 'Catholic Solutions Admin',
    category: 'SaaS Super Admin',
    route: '/admin',
    origin: environment.origins.platformAdmin,
    favicon: '/favicon.svg',
    themeColor: '#12264c',
    title: 'Catholic Solutions Admin',
  },
};
