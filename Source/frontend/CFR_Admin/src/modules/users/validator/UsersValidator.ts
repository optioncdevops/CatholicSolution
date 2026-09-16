import { passwordScore, PASSWORD_STRENGTH_HINT } from '@shared/auth/validators';
import type { UsersFormValues } from '../types/usersTypes';
import { MAX_USER_AGE_YEARS, MIN_USER_AGE_YEARS } from '../utils/usersHelpers';

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
  // Not required: legacy users saved before this field existed have no date of birth on file, and
  // re-saving their record (e.g. a status change) must not force one to be entered retroactively.
  dateOfBirth: {
    validate: (value: string) => {
      if (!value) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dob = new Date(`${value}T00:00:00`);
      if (dob > today) return 'Date of birth cannot be in the future.';

      let age = today.getFullYear() - dob.getFullYear();
      const hasNotHadBirthdayYet = (
        today.getMonth() < dob.getMonth()
        || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
      );
      if (hasNotHadBirthdayYet) age -= 1;

      // US convention for a staff/admin account: must be an adult, and a realistic age.
      if (age < MIN_USER_AGE_YEARS) return `Must be at least ${MIN_USER_AGE_YEARS} years old.`;
      if (age > MAX_USER_AGE_YEARS) return 'Enter a valid date of birth.';
      return true;
    },
  },
  isActive: { required: 'This field is required' },
  isLocked: { required: 'This field is required' },
  contactNumber: {
    pattern: { value: /^[0-9]{10}$/, message: 'Enter Contact Number.' },
  },
};
