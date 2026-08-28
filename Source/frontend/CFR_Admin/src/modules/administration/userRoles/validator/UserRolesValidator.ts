import { FIELD_REQUIRED } from '@app/validation/validationMessages';
import type { UserRolesFormValues } from '../types/userRolesTypes';

export const userRolesDefaultValues: UserRolesFormValues = {
  roleName: '',
  description: '',
};

export const userRolesRules = {
  roleName: { required: FIELD_REQUIRED },
};
