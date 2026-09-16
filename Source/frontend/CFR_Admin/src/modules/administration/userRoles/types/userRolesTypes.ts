export type UserRoleStatusValue = 'active' | 'inactive';

export interface UserRolesApiItem {
  roleId: number;
  roleName: string;
  description: string;
  status: UserRoleStatusValue;
  createdDate: string | null;
  createdBy?: string | null;
  modifiedDate?: string | null;
  modifiedBy?: string | null;
  usersCount: number;
}

export interface UserRolesFormValues {
  roleName: string;
  description: string;
}

export interface SaveUserRolePayload {
  roleId: number;
  roleName: string;
  description: string;
  status: UserRoleStatusValue;
}
