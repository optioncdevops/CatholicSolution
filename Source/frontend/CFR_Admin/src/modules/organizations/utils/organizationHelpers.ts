import type { OrganizationApiItem } from '../types/organizationTypes';

export const normalizeOrganizationsList = (resultData: unknown): OrganizationApiItem[] => {
  if (!Array.isArray(resultData)) return [];
  return resultData as OrganizationApiItem[];
};

export const normalizeOrganization = (resultData: unknown): OrganizationApiItem | null => {
  if (!resultData || typeof resultData !== 'object') return null;
  return resultData as OrganizationApiItem;
};

// Single source of truth for the real status vocabulary core.Organization.OrgStatus supports —
// shared by the profile form's dropdown and the list page's status filter so they can never
// drift. Matches the tone map StatusBadge already ships for kind="organization".
export const ORG_STATUS_OPTIONS: Array<{ id: string; value: string }> = [
  { id: 'active', value: 'Active' },
  { id: 'trial', value: 'Trial' },
  { id: 'suspended', value: 'Suspended' },
];
