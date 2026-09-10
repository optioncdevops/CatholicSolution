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
  firstName: { required: 'First name is required.' },
  lastName: { required: 'Last name is required.' },
  eMail: {
    required: 'Email address is required.',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address.',
    },
  },
  password: {
    required: 'Password is required.',
    validate: (value: string) => passwordScore(value) >= 3 || PASSWORD_STRENGTH_HINT,
  },
  roleId: { required: 'Role is required.' },
  dateOfBirth: { required: 'Date of birth is required.' },
  isActive: { required: 'Status is required.' },
  isLocked: { required: 'Locked is required.' },
  contactNumber: {
    pattern: { value: /^[+()\d][\d\s().-]{6,19}$/, message: 'Enter a valid contact number.' },
  },
};
