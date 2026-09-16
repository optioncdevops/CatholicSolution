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
  firstName: {
    required: 'This field is required',
    maxLength: {
      value: 50,
      message: 'First name cannot exceed 50 characters',
    },
  },
  lastName: {
    required: 'This field is required',
    maxLength: {
      value: 50,
      message: 'Last name cannot exceed 50 characters',
    },
  },
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
  dateOfBirth: { 
    required: 'This field is required',
    validate: (value: string) => {
      if (!value) return true;
      const [year, month, day] = value.split('-').map(Number);
      if (!year || !month || !day) return true;
      const selectedLocal = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedLocal <= today || 'Date of birth cannot be in the future';
    }
  },
  isActive: { required: 'This field is required' },
  isLocked: { required: 'This field is required' },
  contactNumber: {
    pattern: { value: /^[0-9]{10}$/, message: 'Enter Contact Number.' },
  },
};
