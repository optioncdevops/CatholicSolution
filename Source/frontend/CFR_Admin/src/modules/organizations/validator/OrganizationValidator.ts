import type { OrganizationFormValues } from '../types/organizationTypes';

export const organizationDefaultValues: OrganizationFormValues = {
  orgName: '',
  orgStatus: 'active',
  orgType: '',
  contactEmail: '',
  website: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
};

export const organizationRules = {
  orgName: {
    required: 'Organization name is required.',
  },
  orgType: {
    required: 'Organization type is required.',
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
  zip: {
    pattern: {
      value: /^[A-Z0-9][A-Z0-9\s-]{2,9}$/i,
      message: 'Enter a valid ZIP/postal code.',
    },
  },
};
