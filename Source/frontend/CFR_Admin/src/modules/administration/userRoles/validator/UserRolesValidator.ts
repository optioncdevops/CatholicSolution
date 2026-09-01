import type { UserRolesFormValues } from '../types/userRolesTypes';

export const userRolesDefaultValues: UserRolesFormValues = {
  roleName: '',
  description: '',
};

export const userRolesRules = {
  roleName: { required: 'Role name is required.' },
};
