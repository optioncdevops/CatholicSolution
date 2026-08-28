/**
 * Shared mock data for the dev-only Component Library sample pages
 * (`SampleAddPage.tsx` / `SampleViewPage.tsx`). Deliberately has zero dependency on
 * `AdminDataContext` or any real entity type — this whole `sample/` folder is meant to be
 * deletable in one shot without touching the rest of the app. See the removal note at the
 * top of either page file for exactly what else to delete alongside it.
 */

export const SAMPLE_SINGLE_OPTIONS = [
  { id: 'active', value: 'Active' },
  { id: 'inactive', value: 'Inactive' },
  { id: 'coming-soon', value: 'Coming soon' },
];

export const SAMPLE_GROUPED_OPTIONS = [
  { label: 'Core team', options: [{ id: 'jordan', value: 'Jordan Reyes' }, { id: 'sam', value: 'Sam Patel' }] },
  { label: 'Partners', options: [{ id: 'alex', value: 'Alex Kim' }, { id: 'taylor', value: 'Taylor Nguyen', disabled: true }] },
];

export const SAMPLE_MULTI_OPTIONS = [
  { id: 'billing', value: 'Billing' },
  { id: 'support', value: 'Support' },
  { id: 'engineering', value: 'Engineering' },
  { id: 'design', value: 'Design' },
];

export const SAMPLE_RADIO_OPTIONS = [
  { id: 'email', value: 'Email' },
  { id: 'sms', value: 'SMS' },
  { id: 'none', value: 'None' },
];

export const SAMPLE_CHECKBOX_OPTIONS = [
  { id: 'invoices', value: 'Invoices' },
  { id: 'requests', value: 'Access requests' },
  { id: 'digest', value: 'Weekly digest' },
];

export interface SampleRow {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive' | 'coming-soon';
  updatedAt: string;
  amount: number;
}

export const SAMPLE_TABLE_ROWS: SampleRow[] = [
  { id: 'row-1', name: 'OptionC School', category: 'Education', status: 'active', updatedAt: '2026-08-12', amount: 249 },
  { id: 'row-2', name: 'Parish Hub', category: 'Faith', status: 'active', updatedAt: '2026-08-09', amount: 199 },
  { id: 'row-3', name: 'Matt Money', category: 'Billing', status: 'inactive', updatedAt: '2026-08-05', amount: 149 },
  { id: 'row-4', name: 'ArcAlerts', category: 'Communication', status: 'coming-soon', updatedAt: '2026-07-30', amount: 79 },
  { id: 'row-5', name: 'Catholic Content', category: 'Faith', status: 'coming-soon', updatedAt: '2026-07-22', amount: 39 },
];
