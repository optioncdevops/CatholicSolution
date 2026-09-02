import type { OrganizationFormValues } from '../types/organizationTypes';

export const organizationDefaultValues: OrganizationFormValues = {
  orgName: '',
  orgStatus: 'active',
  contactEmail: '',
  website: '',
  contactPerson: '',
  contactPhone: '',
};

export const organizationRules = {
  orgName: {
    required: 'Organization name is required.',
  },
  contactEmail: {
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address.',
    },
  },
  website: {
    pattern: {
      value: /^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i,
      message: 'Enter a valid domain, e.g. example.org.',
    },
  },
  contactPhone: {
    pattern: {
      value: /^[+()\d][\d\s().-]{6,19}$/,
      message: 'Enter a valid phone number.',
    },
  },
};
