import type { UserRolesFormValues } from '../types/userRolesTypes';

export const userRolesDefaultValues: UserRolesFormValues = {
  roleName: '',
  description: '',
};

export const userRolesRules = {
  roleName: {
    required: 'This field is required',
    maxLength: {
      value: 50,
      message: 'Role name cannot exceed 50 characters',
    },
  },
  description: {
    maxLength: {
      value: 250,
      message: 'Description cannot exceed 250 characters',
    },
  },
};
