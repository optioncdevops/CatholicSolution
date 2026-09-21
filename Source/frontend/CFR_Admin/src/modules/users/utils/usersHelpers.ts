import type { UsersApiItem, UsersFormValues } from '../types/usersTypes';

export const toDateOnly = (value?: string | null): string => {
  if (!value?.trim()) return '';
  return value.trim().slice(0, 10);
};

// US business-application convention for a Date of Birth field: the account holder must be an
// adult (18+, the standard US age of majority) and the date must be realistic (no more than 120
// years old) — mirrored server-side in UsersService.SaveUserAsync so the rule can't be bypassed
// by a direct API call.
export const MIN_USER_AGE_YEARS = 18;
export const MAX_USER_AGE_YEARS = 120;

const isoDateYearsAgo = (years: number): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
};

/** Latest DOB a user may enter and still be at least {@link MIN_USER_AGE_YEARS} old, today. */
export const maxAllowedDateOfBirth = (): string => isoDateYearsAgo(MIN_USER_AGE_YEARS);

/** Earliest DOB considered realistic — {@link MAX_USER_AGE_YEARS} years ago. */
export const minAllowedDateOfBirth = (): string => isoDateYearsAgo(MAX_USER_AGE_YEARS);

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
  organizationId: values.organizationId ? Number(values.organizationId) : null,
  roleId: Number(values.roleId),
  isActive: Number(values.isActive) === 0 ? 0 : 1,
  isLocked: Number(values.isLocked) === 1 ? 1 : 0,
  dateOfBirth: toDateOnly(values.dateOfBirth) || null,
  contactNumber: values.contactNumber.trim() || null,
});
