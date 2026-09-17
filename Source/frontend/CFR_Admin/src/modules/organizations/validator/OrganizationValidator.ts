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
    maxLength: {
      value: 100,
      message: 'Organization name cannot exceed 100 characters.',
    },
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
  contactPerson: {
    maxLength: {
      value: 50,
      message: 'Contact person cannot exceed 50 characters.',
    },
  },
  contactPhone: {
    pattern: {
      value: /^[0-9]{10}$/,
      message: 'Enter Contact Number.',
    },
  },
  zip: {
    pattern: {
      value: /^\d{5}$/,
      message: 'Enter exactly 5 digits for the ZIP code.',
    },
  },
  address: {
    maxLength: {
      value: 500,
      message: 'Address cannot exceed 500 characters.',
    },
  },
};
