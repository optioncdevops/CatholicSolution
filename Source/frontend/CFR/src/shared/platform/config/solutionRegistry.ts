import { environment } from './environment';

export type SolutionId = 'platform' | 'cfr-admin';

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

/** CFR and the separate CFRAdmin console are the deployable platform applications owned by this repository. */
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
  'cfr-admin': {
    id: 'cfr-admin',
    name: 'CFRAdmin',
    category: 'SaaS Administration',
    route: '/admin',
    origin: environment.origins.platformAdmin,
    favicon: '/favicon.svg',
    themeColor: '#12264c',
    title: 'CFRAdmin',
  },
};
