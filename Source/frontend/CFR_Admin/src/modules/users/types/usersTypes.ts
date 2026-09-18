export type UserStatusValue = 'active' | 'inactive';

export interface UsersApiItem {
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  eMail: string;
  organizationId: number | null;
  organizationName: string | null;
  roleId: number;
  roleName: string;
  isActive: number;
  isLocked: number;
  status: UserStatusValue;
  dateOfBirth: string | null;
  contactNumber: string | null;
  lastActiveAt: string | null;
}

export interface RoleLookupItem {
  roleId: number;
  roleName: string;
}

export interface OrganizationLookupItem {
  organizationId: number;
  name: string;
}

export interface UsersFormValues {
  firstName: string;
  lastName: string;
  eMail: string;
  password: string;
  organizationId: string;
  roleId: string;
  isActive: string;
  isLocked: string;
  dateOfBirth: string;
  contactNumber: string;
}

export interface SaveUserPayload {
  userId: number;
  firstName: string;
  lastName: string;
  eMail: string;
  password: string;
  organizationId: number | null;
  roleId: number;
  isActive: number;
  isLocked: number;
  dateOfBirth: string | null;
  contactNumber: string | null;
}
