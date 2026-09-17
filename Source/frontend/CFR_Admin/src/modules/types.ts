/**
 * Active: available and launchable.
 * Inactive: temporarily unavailable (was launchable, paused).
 * Coming Soon: visible in listings but not launchable yet.
 * On Request: not launchable directly — users request access.
 * Archived: hidden from normal product listings.
 */
export type ProductStatus = 'active' | 'inactive' | 'coming-soon';
export type ProductLicenseType = 'free' | 'licensed';
export type ProductOwnership = 'first-party' | 'partner';
export type ProductDeploymentModel = 'external-saas';
export type ProductNavigationTarget = 'same-tab' | 'new-tab';

/** A managed application (product) in the Catholic Solutions registry. */
export interface AdminApplication {
  /** Registry id — read-only, never edited or reassigned in this prototype. */
  id: string;
  /** Read-only internal registry reference (mock, simulates a backing record id). */
  registryRef: string;
  /** Read-only source location the product is deployed from (mock). */
  sourceLocation: string;
  name: string;
  shortName: string;
  /** Shown as the product's subtitle, under its name, throughout the UI. */
  category: string;
  /** An emoji, or an uploaded logo image as a data URL. */
  icon: string;
  gradient: string;
  description: string;
  features: string[];
  productionUrl: string;
  /** Read-only in this prototype — ownership does not change via product editing. */
  ownership: ProductOwnership;
  /** Read-only in this prototype. */
  deploymentModel: ProductDeploymentModel;
  licenseType: ProductLicenseType;
  navigationTarget: ProductNavigationTarget;
  status: ProductStatus;
  updatedAt: string;
  updatedByName?: string;
  contactUserId?: string;
  contactPersonName?: string;
}

export type OrganizationStatus = 'active' | 'trial' | 'suspended';
/** Derived from {@link Organization.expiryDate} vs today — never stored, always computed. */
export type CustomerAccessStatus = 'active' | 'expiring-soon' | 'expired';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'starter' | 'growth' | 'enterprise';
  status: OrganizationStatus;
  appIds: string[];
  createdAt: string;
  /** Short customer/account code shown in invoices and the customers table. */
  code: string;
  primaryContact: string;
  contactEmail: string;
  contactPhone: string;
  /** Subscription/access expiry date — drives {@link CustomerAccessStatus}. */
  expiryDate: string;
  /** Registered/legal business name, when different from the everyday display name. */
  legalName?: string;
  /** Business type / industry classification, e.g. "Education", "Parish". */
  industry?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  /** IANA timezone id, e.g. "America/Chicago". */
  timezone?: string;
  /** Preferred language/region, e.g. "en-US". */
  locale?: string;
  /** ISO 4217 currency code, e.g. "USD". */
  currency?: string;
  /** Logo image URL or local object-URL preview — prototype only, never uploaded anywhere. */
  logoUrl?: string;
  /** Brand accent color (hex), used for lightweight visual identity — prototype only. */
  brandColor?: string;
}

export type UserRole = 'owner' | 'admin' | 'member';
export type UserStatus = 'active' | 'invited' | 'deactivated';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  orgId: string;
  appAccessIds: string[];
  lastActiveAt: string;
}

/** A configurable role definition shown in the role catalog and permission grid — distinct
 * from {@link UserRole}, the fixed owner/admin/member value stored on a user record. */
export interface AdminRole {
  id: string;
  name: string;
  description: string;
  /** Route a user with this role lands on after signing in. */
  landingPage: string;
  createdAt: string;
  active: boolean;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'info-requested';

export interface RequestTimelineEntry {
  status: RequestStatus | 'submitted';
  at: string;
  note?: string;
  actor: string;
}

export interface AccessRequest {
  id: string;
  orgId: string;
  requesterName: string;
  requesterEmail: string;
  appId: string;
  status: RequestStatus;
  submittedAt: string;
  timeline: RequestTimelineEntry[];
}

export interface ActivityItem {
  id: string;
  message: string;
  at: string;
  actor: string;
  kind: 'application' | 'organization' | 'user' | 'request';
}

/** Stored base state. 'expiring-soon' and 'expired' are never stored — they're derived live
 * from {@link License.expiryDate}, see {@link effectiveLicenseStatus}. */
export type LicenseStatus = 'active' | 'suspended';
export type EffectiveLicenseStatus = LicenseStatus | 'expiring-soon' | 'expired';

/** A product license issued to an organization — the industry-standard seat/term/key shape
 * (license key, seat count, start/expiry date) rather than a billing document. */
export interface License {
  id: string;
  licenseNumber: string;
  /** The actual license key handed to the customer, e.g. "AB12-CD34-EF56-GH78". */
  licenseKey: string;
  orgId: string;
  appId: string;
  /** Customer-facing license title, e.g. "OptionC School — Fall Term Renewal". */
  title?: string;
  /** Omitted = unlimited seats (a site/org-wide license) rather than a per-seat one. */
  seats?: number;
  startDate: string;
  expiryDate: string;
  status: LicenseStatus;
  /** Optional note shown to the customer alongside the license, e.g. onboarding instructions. */
  customMessage?: string;
}
