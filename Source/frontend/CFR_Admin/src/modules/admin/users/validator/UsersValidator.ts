import { FIELD_REQUIRED } from '@app/validation/validationMessages';
import type { UsersFormValues } from '../types/usersTypes';

export const usersDefaultValues: UsersFormValues = {
  firstName: '',
  lastName: '',
  eMail: '',
  password: '',
  organizationId: '',
  roleId: '',
  status: 'invited',
};

export const usersRules = {
  firstName: { required: FIELD_REQUIRED },
  lastName: { required: FIELD_REQUIRED },
  eMail: {
    required: FIELD_REQUIRED,
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address.',
    },
  },
  password: { required: FIELD_REQUIRED },
  organizationId: { required: FIELD_REQUIRED },
  roleId: { required: FIELD_REQUIRED },
};
