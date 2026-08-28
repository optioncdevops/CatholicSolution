export type UserStatusValue = 'active' | 'invited' | 'deactivated';

export interface UsersApiItem {
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  eMail: string;
  organizationId: number;
  organizationName: string;
  roleId: number;
  roleName: string;
  status: UserStatusValue;
  lastActiveAt: string | null;
}

export interface OrganizationLookupItem {
  organizationId: number;
  name: string;
}

export interface RoleLookupItem {
  roleId: number;
  roleName: string;
}

export interface UserLookupResult {
  organizations: OrganizationLookupItem[];
  roles: RoleLookupItem[];
}

export interface UsersFormValues {
  firstName: string;
  lastName: string;
  eMail: string;
  password: string;
  organizationId: string;
  roleId: string;
  status: 'active' | 'invited';
}

export interface SaveUserPayload {
  userId: number;
  firstName: string;
  lastName: string;
  eMail: string;
  password: string;
  organizationId: number;
  roleId: number;
  status: string;
}
