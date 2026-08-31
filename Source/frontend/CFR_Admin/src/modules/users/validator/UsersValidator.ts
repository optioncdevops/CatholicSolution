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
  password: { required: 'Password is required.' },
  roleId: { required: 'Role is required.' },
  dateOfBirth: { required: 'Date of birth is required.' },
  isActive: { required: 'Status is required.' },
  isLocked: { required: 'Locked is required.' },
};
