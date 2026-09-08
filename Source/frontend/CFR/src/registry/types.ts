export type AppKind = 'launchable' | 'external' | 'ai' | 'discover';
export type AppStatus = 'active' | 'all-clear' | 'available' | 'ai-powered' | 'coming-soon';
export type AppNavigationTarget = 'same-tab' | 'new-tab';
export type AppHubSection = 'your' | 'available' | 'future';
export type AppDeploymentModel = 'external-saas';
export type AppOwnership = 'first-party' | 'partner';

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
  contactEmail?: string;
  contactUserId?: number | string;
  /** App Hub ownership/discovery state. This is the only section-classification field. */
  hubSection: AppHubSection;
  /** Business applications are deployed outside this repository on independently managed domains. */
  deploymentModel: AppDeploymentModel;
  /** Product ownership is independent from deployment location. */
  ownership: AppOwnership;
  /** Whether this app is approved to appear in the centrally published App Switcher. */
  launcherEnabled: boolean;
  /**
   * Numeric [core].[Product] identifier used for SSO launch. Catalog slugs stay on `id`.
   */
  productId?: number;
  /**
   * When true, Available Apps may show Request. Set from [auth].[UserProduct].RoleId 4 or 9.
   */
  canRequest?: boolean;
  /**
   * When true, an access request for this product was already approved for the member's organization.
   */
  isOrgApproved?: boolean;
  /**

   * Approved independently deployed destination. Products do not need an `apps/*`
   * workspace inside Catholic_Solution to participate in App Hub or the launcher.
   * Production destinations must use HTTPS; localhost HTTP is reserved for development.
   */
  externalUrl?: string;
  /**
   * Launch behavior used by App Hub, Details actions, and the hosted App Switcher.
   * Same-tab is the default. New-tab destinations are protected with noopener/noreferrer.
   */
  navigationTarget?: AppNavigationTarget;
}
