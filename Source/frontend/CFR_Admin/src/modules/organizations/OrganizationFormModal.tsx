import { useState } from 'react';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { DatePicker, Dropdown, InputField } from '@app/components/formControls';
import type { Organization, OrganizationStatus } from '../types';

const PLAN_OPTIONS: Array<{ id: Organization['plan']; value: string }> = [
  { id: 'starter', value: 'Starter' },
  { id: 'growth', value: 'Growth' },
  { id: 'enterprise', value: 'Enterprise' },
];

const STATUS_OPTIONS: Array<{ id: OrganizationStatus; value: string }> = [
  { id: 'trial', value: 'Trial' },
  { id: 'active', value: 'Active' },
  { id: 'suspended', value: 'Suspended' },
];

function inDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

export interface NewOrganizationValue {
  name: string;
  domain: string;
  plan: Organization['plan'];
  status: OrganizationStatus;
  primaryContact: string;
  contactEmail: string;
  contactPhone: string;
  expiryDate: string;
}

interface FieldErrors {
  name?: string;
  domain?: string;
  primaryContact?: string;
  contactEmail?: string;
  contactPhone?: string;
}

function validate(form: NewOrganizationValue): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Organization name is required.';
  if (!form.domain.trim()) errors.domain = 'Website is required.';
  else if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(form.domain.trim())) errors.domain = 'Enter a valid domain, e.g. example.org.';
  if (!form.primaryContact.trim()) errors.primaryContact = 'Contact person is required.';
  if (!form.contactEmail.trim()) errors.contactEmail = 'Contact email is required.';
  else if (!/^\S+@\S+\.\S+$/.test(form.contactEmail.trim())) errors.contactEmail = 'Enter a valid email address.';
  if (!form.contactPhone.trim()) errors.contactPhone = 'Contact number is required.';
  return errors;
}

function emptyForm(): NewOrganizationValue {
  return {
    name: '', domain: '', plan: 'starter', status: 'trial',
    primaryContact: '', contactEmail: '', contactPhone: '', expiryDate: inDays(365),
  };
}

interface OrganizationFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (value: NewOrganizationValue) => void;
}

/** Standard "add a customer" form: identity, plan/status, primary contact, and an initial
 * subscription expiry — mirrors UserFormModal's shape (reset-on-open, inline validation,
 * disabled Save until valid) so every "Add X" flow in this app behaves the same way. */
export function OrganizationFormModal({ open, onClose, onCreate }: OrganizationFormModalProps) {
  const [form, setForm] = useState<NewOrganizationValue>(emptyForm);
  const [touched, setTouched] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    if (open) { setForm(emptyForm()); setTouched(false); }
    setWasOpen(open);
  }

  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;

  const update = <K extends keyof NewOrganizationValue>(key: K, value: NewOrganizationValue[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setTouched(true);
  };

  const handleSubmit = () => {
    setTouched(true);
    if (hasErrors) return;
    onCreate(form);
  };

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title="Add Organization"
      size="md"
      showMandatory
      footer={(
        <>
          <CommonButton variant="outline" onClick={onClose}>Cancel</CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit} disabled={hasErrors}>Save</CommonButton>
        </>
      )}
    >
      <form onSubmit={(event) => { event.preventDefault(); handleSubmit(); }} className="grid gap-4 sm:grid-cols-2" noValidate>
        <InputField label="Organization Name" required value={form.name} onChange={(event) => update('name', event.target.value)} error={touched ? errors.name : undefined} wrapperClassName="sm:col-span-2" />
        <InputField label="Website" required placeholder="example.org" value={form.domain} onChange={(event) => update('domain', event.target.value)} error={touched ? errors.domain : undefined} />
        <Dropdown
          label="Plan" searchable={false} clearable={false}
          value={form.plan}
          onValueChange={(value) => update('plan', (value as Organization['plan']) ?? 'starter')}
          options={PLAN_OPTIONS}
        />
        <Dropdown
          label="Status" searchable={false} clearable={false}
          value={form.status}
          onValueChange={(value) => update('status', (value as OrganizationStatus) ?? 'trial')}
          options={STATUS_OPTIONS}
        />
        <DatePicker
          label="Access Expiry Date" required
          value={form.expiryDate}
          outputFormat="yyyy-MM-dd" displayFormat="MM/dd/yyyy"
          onChange={(value) => update('expiryDate', value)}
        />
        <InputField label="Contact Person" required value={form.primaryContact} onChange={(event) => update('primaryContact', event.target.value)} error={touched ? errors.primaryContact : undefined} />
        <InputField label="Contact Email" required type="email" value={form.contactEmail} onChange={(event) => update('contactEmail', event.target.value)} error={touched ? errors.contactEmail : undefined} />
        <InputField label="Contact Number" required type="tel" placeholder="(312) 555-0100" value={form.contactPhone} onChange={(event) => update('contactPhone', event.target.value)} error={touched ? errors.contactPhone : undefined} />
      </form>
    </BaseModal>
  );
}
