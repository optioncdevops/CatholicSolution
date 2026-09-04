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
// drift. Matches the tone map StatusBadge already ships for kind="organization". Confirmed
// against the live CK__Organizat__OrgSt__4B0D20AB CHECK constraint, which allows exactly these
// three values — 'trial' was an earlier, unverified guess and is not actually permitted by the
// database (attempting to save it fails the constraint and surfaces as a 500).
export const ORG_STATUS_OPTIONS: Array<{ id: string; value: string }> = [
  { id: 'active', value: 'Active' },
  { id: 'inactive', value: 'Inactive' },
  { id: 'suspended', value: 'Suspended' },
];

// Single source of truth for the organization type vocabulary — shared by the profile/add
// forms' dropdown and the list page's display so they can never drift. Matches the exact
// vocabulary (and stored string values) used by the member-facing Request Access page
// (frontend/CFR/src/modules/authentication/RequestAccessPage.tsx's `organizationTypes`), so an
// organization created from an access request and one created here read/write the same values.
export const ORG_TYPE_OPTIONS: Array<{ id: string; value: string }> = [
  { id: 'Catholic School', value: 'Catholic School' },
  { id: 'Parish', value: 'Parish' },
  { id: 'Diocese / Archdiocese', value: 'Diocese / Archdiocese' },
  { id: 'Ministry / Nonprofit', value: 'Ministry / Nonprofit' },
  { id: 'Other', value: 'Other' },
];

export const orgTypeLabel = (orgType: string | null | undefined): string =>
  ORG_TYPE_OPTIONS.find((option) => option.id === orgType)?.value ?? (orgType || '—');

// Distinct Badge tone per organization type so the Type column is scannable by color as well as
// label (never color alone — the label text is always shown too). Falls back to neutral for any
// value outside ORG_TYPE_OPTIONS (this column is an app convention, not DB-enforced).
const ORG_TYPE_TONE: Record<string, 'success' | 'warning' | 'neutral' | 'danger' | 'info'> = {
  'Catholic School': 'info',
  Parish: 'success',
  'Diocese / Archdiocese': 'warning',
  'Ministry / Nonprofit': 'danger',
  Other: 'neutral',
};

export const orgTypeTone = (orgType: string | null | undefined): 'success' | 'warning' | 'neutral' | 'danger' | 'info' =>
  (orgType && ORG_TYPE_TONE[orgType]) || 'neutral';

// Display-only identifier, e.g. "ORG-15001" — the same ORG-<OrgId> format already used by the
// product Customers tab (Acutis_Products_CRUD ActionId 9's OrgCode column). Computed from OrgId
// rather than stored, since it's a deterministic display format, not a separate database value.
export const formatOrgCode = (orgId: number): string => `ORG-${orgId}`;

// Composes the address parts into a single display line, e.g. "123 Main St, Springfield, IL 62704".
// City/state are joined with a comma; the ZIP trails the state with just a space (US postal convention).
export const composeOrganizationAddress = (organization: Pick<OrganizationApiItem, 'address' | 'city' | 'state' | 'zip'>): string => {
  const line2 = [organization.city, organization.state].filter((part) => part?.trim()).join(', ');
  const line2WithZip = [line2, organization.zip?.trim()].filter(Boolean).join(' ');
  return [organization.address?.trim(), line2WithZip].filter(Boolean).join(', ');
};
