/**
 * Active: available and launchable.
 * Inactive: temporarily unavailable (was launchable, paused).
 * Coming Soon: visible in listings but not launchable yet.
 * On Request: not launchable directly — users request access.
 * Archived: hidden from normal product listings.
 */
export type ProductStatus = 'active' | 'inactive' | 'coming-soon' | 'on-request' | 'archived';
export type ProductVisibility = 'public' | 'hidden';
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
  category: string;
  icon: string;
  gradient: string;
  description: string;
  features: string[];
  integrations: string[];
  productionUrl: string;
  /** Read-only in this prototype — ownership does not change via product editing. */
  ownership: ProductOwnership;
  /** Read-only in this prototype. */
  deploymentModel: ProductDeploymentModel;
  visibility: ProductVisibility;
  navigationTarget: ProductNavigationTarget;
  status: ProductStatus;
  updatedAt: string;
}

export type OrganizationStatus = 'active' | 'trial' | 'suspended';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'starter' | 'growth' | 'enterprise';
  status: OrganizationStatus;
  appIds: string[];
  createdAt: string;
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
}

export type PermissionLevel = 'read-only' | 'full-control' | 'deny';

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
