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

// Display-only identifier, e.g. "15001" — just the OrgId. Computed from OrgId rather than stored,
// since it's a deterministic display format, not a separate database value.
export const formatOrgCode = (orgId: number): string => `${orgId}`;

// Standard USPS two-letter state/territory codes as the stored value (matches existing data like
// "CA"), with the full name as the friendly display label — an industry-standard address-form
// pattern (e.g. Stripe, USPS lookup tools) rather than a free-text state field prone to typos
// ("Calif.", "california", "Ca") that would silently break exact-match filtering/sorting.
export const US_STATE_OPTIONS: Array<{ id: string; value: string }> = [
  { id: 'AL', value: 'Alabama' }, { id: 'AK', value: 'Alaska' }, { id: 'AZ', value: 'Arizona' },
  { id: 'AR', value: 'Arkansas' }, { id: 'CA', value: 'California' }, { id: 'CO', value: 'Colorado' },
  { id: 'CT', value: 'Connecticut' }, { id: 'DE', value: 'Delaware' }, { id: 'DC', value: 'District of Columbia' },
  { id: 'FL', value: 'Florida' }, { id: 'GA', value: 'Georgia' }, { id: 'HI', value: 'Hawaii' },
  { id: 'ID', value: 'Idaho' }, { id: 'IL', value: 'Illinois' }, { id: 'IN', value: 'Indiana' },
  { id: 'IA', value: 'Iowa' }, { id: 'KS', value: 'Kansas' }, { id: 'KY', value: 'Kentucky' },
  { id: 'LA', value: 'Louisiana' }, { id: 'ME', value: 'Maine' }, { id: 'MD', value: 'Maryland' },
  { id: 'MA', value: 'Massachusetts' }, { id: 'MI', value: 'Michigan' }, { id: 'MN', value: 'Minnesota' },
  { id: 'MS', value: 'Mississippi' }, { id: 'MO', value: 'Missouri' }, { id: 'MT', value: 'Montana' },
  { id: 'NE', value: 'Nebraska' }, { id: 'NV', value: 'Nevada' }, { id: 'NH', value: 'New Hampshire' },
  { id: 'NJ', value: 'New Jersey' }, { id: 'NM', value: 'New Mexico' }, { id: 'NY', value: 'New York' },
  { id: 'NC', value: 'North Carolina' }, { id: 'ND', value: 'North Dakota' }, { id: 'OH', value: 'Ohio' },
  { id: 'OK', value: 'Oklahoma' }, { id: 'OR', value: 'Oregon' }, { id: 'PA', value: 'Pennsylvania' },
  { id: 'RI', value: 'Rhode Island' }, { id: 'SC', value: 'South Carolina' }, { id: 'SD', value: 'South Dakota' },
  { id: 'TN', value: 'Tennessee' }, { id: 'TX', value: 'Texas' }, { id: 'UT', value: 'Utah' },
  { id: 'VT', value: 'Vermont' }, { id: 'VA', value: 'Virginia' }, { id: 'WA', value: 'Washington' },
  { id: 'WV', value: 'West Virginia' }, { id: 'WI', value: 'Wisconsin' }, { id: 'WY', value: 'Wyoming' },
  { id: 'PR', value: 'Puerto Rico' },
];

export const stateLabel = (state: string | null | undefined): string =>
  US_STATE_OPTIONS.find((option) => option.id === state)?.value ?? (state || '—');

// Composes the address parts into a single display line, e.g. "123 Main St, Springfield, IL 62704".
// City/state are joined with a comma; the ZIP trails the state with just a space (US postal convention).
export const composeOrganizationAddress = (organization: Pick<OrganizationApiItem, 'address' | 'city' | 'state' | 'zip'>): string => {
  const line2 = [organization.city, organization.state].filter((part) => part?.trim()).join(', ');
  const line2WithZip = [line2, organization.zip?.trim()].filter(Boolean).join(' ');
  return [organization.address?.trim(), line2WithZip].filter(Boolean).join(', ');
};
