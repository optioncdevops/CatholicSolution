export type AppKind = 'launchable' | 'external' | 'ai' | 'discover';
export type AppStatus = 'active' | 'all-clear' | 'available' | 'ai-powered' | 'coming-soon';
export type AppNavigationTarget = 'same-tab' | 'new-tab';

export interface AppStat {
  value: string;
  label: string;
}

export interface AppActivity {
  title: string;
  meta?: string;
}

export interface AppExtendedDetails {
  longDescription: string;
  included: string[];
  integrations: string[];
  activity?: AppActivity[];
  steps?: string[];
}

export interface CatalogApp {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  icon: string;
  gradient: string;
  keywords: string[];
  features: string[];
  stats: AppStat[];
  kind: AppKind;
  status: AppStatus;
  statusLabel: string;
  statusDetail?: string;
  details?: AppExtendedDetails;
  /**
   * Domain-relative entry route. Present only for `launchable` Catholic Solutions
   * applications that resolve through `SOLUTION_REGISTRY` and the central login.
   */
  route?: string;
  /**
   * Absolute URL of a partner product hosted outside the Catholic Solutions SSO
   * boundary. Present only for `external` apps. An `external` app without this
   * value is not yet published and renders as a non-interactive "Coming soon" card.
   */
  externalUrl?: string;
  /**
   * Launch behavior used by App Hub, Details actions, and the shared switcher.
   * Same-tab is the safe default. Only products explicitly marked `new-tab` open a
   * separate protected browser tab.
   */
  navigationTarget?: AppNavigationTarget;
}
