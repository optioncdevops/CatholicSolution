import type { UsersApiItem, UsersFormValues, UserStatusValue } from '../types/usersTypes';

export const normalizeUsersList = (resultData: unknown): UsersApiItem[] => {
  if (!Array.isArray(resultData)) return [];
  return resultData as UsersApiItem[];
};

export const normalizeUser = (resultData: unknown): UsersApiItem | null => {
  if (!resultData || typeof resultData !== 'object') return null;
  return resultData as UsersApiItem;
};

export const splitFullName = (name: string): { firstName: string; lastName: string } => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

export const toSaveUserPayload = (values: UsersFormValues, userId = 0) => ({
  userId,
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  eMail: values.eMail.trim(),
  password: values.password,
  organizationId: Number(values.organizationId),
  roleId: Number(values.roleId),
  status: values.status,
});

export const isUserStatus = (value: string): value is UserStatusValue => (
  value === 'active' || value === 'invited' || value === 'deactivated'
);
