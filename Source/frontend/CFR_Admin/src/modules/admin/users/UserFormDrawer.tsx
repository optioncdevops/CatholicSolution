import { useState } from 'react';
import { Drawer } from '../components/Drawer';
import { Button } from '../components/form/Button';
import { TextField } from '../components/form/TextField';
import { SelectField } from '../components/form/SelectField';
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

interface UserFormDrawerProps {
  open: boolean;
  organizations: Organization[];
  onClose: () => void;
  onCreate: (value: NewUserValue) => void;
}

export function UserFormDrawer({ open, organizations, onClose, onCreate }: UserFormDrawerProps) {
  const emptyForm: NewUserValue = { name: '', email: '', role: 'member', orgId: organizations[0]?.id ?? '', status: 'invited' };
  const [form, setForm] = useState<NewUserValue>(emptyForm);
  const [touched, setTouched] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    // Reset the form each time the drawer opens fresh (adjusted during render, per this
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
    <Drawer
      open={open}
      title="Add user"
      onClose={onClose}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={hasErrors}>Add user</Button>
        </>
      )}
    >
      <form onSubmit={(event) => { event.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4" noValidate>
        <TextField label="Full name" value={form.name} onChange={(event) => update('name', event.target.value)} error={touched ? errors.name : undefined} />
        <TextField label="Email address" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} error={touched ? errors.email : undefined} />
        <SelectField label="Organization" value={form.orgId} onChange={(event) => update('orgId', event.target.value)}>
          {organizations.length === 0 ? <option value="">No organizations available</option> : null}
          {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
        </SelectField>
        <SelectField label="Role" value={form.role} onChange={(event) => update('role', event.target.value as UserRole)}>
          {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
        </SelectField>
        <fieldset className="flex flex-col gap-1.5 text-[length:var(--admin-text-xs)] [font-weight:var(--admin-weight-bold)] text-[var(--text-secondary)]">
          <legend className="mb-0.5">Initial status</legend>
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
    </Drawer>
  );
}
