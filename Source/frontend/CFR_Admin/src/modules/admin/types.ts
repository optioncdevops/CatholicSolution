export type ApplicationStatus = 'active' | 'on-request' | 'coming-soon' | 'future';
export type ApplicationVisibility = 'public' | 'hidden';

export interface AdminApplication {
  id: string;
  name: string;
  shortName: string;
  category: string;
  icon: string;
  gradient: string;
  description: string;
  features: string[];
  domain: string;
  status: ApplicationStatus;
  visibility: ApplicationVisibility;
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
