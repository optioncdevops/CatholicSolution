import { passwordScore, PASSWORD_STRENGTH_HINT } from '@shared/auth/validators';
import type { UsersFormValues } from '../types/usersTypes';

export const usersDefaultValues: UsersFormValues = {
  firstName: '',
  lastName: '',
  eMail: '',
  password: '',
  roleId: '',
  isActive: '1',
  isLocked: '0',
  dateOfBirth: '',
  contactNumber: '',
};

export const usersRules = {
  firstName: { required: 'This field is required' },
  lastName: { required: 'This field is required' },
  eMail: {
    required: 'This field is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address.',
    },
  },
  password: {
    required: 'This field is required',
    validate: (value: string) => passwordScore(value) >= 3 || PASSWORD_STRENGTH_HINT,
  },
  roleId: { required: 'This field is required' },
  dateOfBirth: { required: 'This field is required' },
  isActive: { required: 'This field is required' },
  isLocked: { required: 'This field is required' },
  contactNumber: {
    pattern: { value: /^[+()\d][\d\s().-]{6,19}$/, message: 'Enter a valid contact number.' },
  },
};
