import { useState } from 'react';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { Dropdown, InputField } from '@app/components/formControls';
import type { Organization, UserRole } from '../types';

const ROLE_OPTIONS: UserRole[] = ['owner', 'admin', 'member'];

export interface NewUserValue {
  name: string;
  email: string;
  role: UserRole;
  orgId: string;
  status: 'active' | 'invited';
}

interface FieldErrors {
  name?: string;
  email?: string;
  orgId?: string;
}

function validate(form: NewUserValue): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!form.orgId) errors.orgId = 'Select an organization.';
  return errors;
}

interface UserFormModalProps {
  open: boolean;
  organizations: Organization[];
  onClose: () => void;
  onCreate: (value: NewUserValue) => void;
}

export function UserFormModal({ open, organizations, onClose, onCreate }: UserFormModalProps) {
  const emptyForm: NewUserValue = { name: '', email: '', role: 'member', orgId: organizations[0]?.id ?? '', status: 'invited' };
  const [form, setForm] = useState<NewUserValue>(emptyForm);
  const [touched, setTouched] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    // Reset the form each time the modal opens fresh (adjusted during render, per this
    // codebase's convention — see AccountModals.tsx).
    if (open) { setForm(emptyForm); setTouched(false); }
    setWasOpen(open);
  }

  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;

  const update = <K extends keyof NewUserValue>(key: K, value: NewUserValue[K]) => {
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
      title="Add User"
      size="sm"
      showMandatory
      footer={(
        <>
          <CommonButton variant="outline" onClick={onClose}>Cancel</CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit} disabled={hasErrors}>Save</CommonButton>
        </>
      )}
    >
      <form onSubmit={(event) => { event.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4" noValidate>
        <InputField label="Full name" required value={form.name} onChange={(event) => update('name', event.target.value)} error={touched ? errors.name : undefined} />
        <InputField label="Email address" required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} error={touched ? errors.email : undefined} />
        <Dropdown
          label="Organization" required searchable={false} clearable={false}
          value={form.orgId}
          onValueChange={(value) => update('orgId', value ?? '')}
          options={organizations.map((org) => ({ id: org.id, value: org.name }))}
          helperText={touched ? errors.orgId : undefined}
        />
        <Dropdown
          label="Role" searchable={false} clearable={false}
          value={form.role}
          onValueChange={(value) => update('role', (value as UserRole) ?? 'member')}
          options={ROLE_OPTIONS.map((role) => ({ id: role, value: role.charAt(0).toUpperCase() + role.slice(1) }))}
        />
        <fieldset className="flex flex-col gap-1.5 text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-bold)] text-[var(--text-secondary)]">
          <legend className="mb-0.5">Initial Status</legend>
          <div className="flex gap-4">
            {(['invited', 'active'] as const).map((option) => (
              <label key={option} className="flex items-center gap-1.5 font-semibold capitalize">
                <input type="radio" name="new-user-status" checked={form.status === option} onChange={() => update('status', option)} />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </BaseModal>
  );
}
