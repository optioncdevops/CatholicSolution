import type { UserRolesApiItem, UserRolesFormValues, UserRoleStatusValue } from '../types/userRolesTypes';

export const normalizeUserRolesList = (resultData: unknown): UserRolesApiItem[] => {
  if (!Array.isArray(resultData)) return [];
  return resultData as UserRolesApiItem[];
};

export const normalizeUserRole = (resultData: unknown): UserRolesApiItem | null => {
  if (!resultData || typeof resultData !== 'object') return null;
  return resultData as UserRolesApiItem;
};

export const toSaveUserRolePayload = (values: UserRolesFormValues, roleId = 0, status: UserRoleStatusValue = 'active') => ({
  roleId,
  roleName: values.roleName.trim(),
  description: values.description.trim(),
  status,
});

export const isUserRoleStatus = (value: string): value is UserRoleStatusValue => (
  value === 'active' || value === 'inactive'
);
