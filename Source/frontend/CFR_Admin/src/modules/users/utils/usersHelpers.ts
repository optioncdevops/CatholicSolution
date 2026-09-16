import type { UsersApiItem, UsersFormValues } from '../types/usersTypes';

export const toDateOnly = (value?: string | null): string => {
  if (!value?.trim()) return '';
  return value.trim().slice(0, 10);
};

export const getTodayDateOnly = (): string => {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
};

export const normalizeUsersList = (resultData: unknown): UsersApiItem[] => {
  if (!Array.isArray(resultData)) return [];
  return resultData.map((row) => normalizeUser(row)).filter((row): row is UsersApiItem => row != null);
};

export const normalizeUser = (resultData: unknown): UsersApiItem | null => {
  if (!resultData || typeof resultData !== 'object') return null;
  const row = resultData as UsersApiItem;
  const isActive = Number(row.isActive) === 1 ? 1 : 0;
  const isLocked = Number(row.isLocked) === 1 ? 1 : 0;
  return {
    ...row,
    isActive,
    isLocked,
    status: isActive === 1 ? 'active' : 'inactive',
    dateOfBirth: toDateOnly(row.dateOfBirth) || null,
  };
};

export const toSaveUserPayload = (values: UsersFormValues, userId = 0) => ({
  userId,
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  eMail: values.eMail.trim(),
  password: values.password,
  roleId: Number(values.roleId),
  isActive: Number(values.isActive) === 0 ? 0 : 1,
  isLocked: Number(values.isLocked) === 1 ? 1 : 0,
  dateOfBirth: toDateOnly(values.dateOfBirth) || null,
  contactNumber: values.contactNumber.trim() || null,
});
