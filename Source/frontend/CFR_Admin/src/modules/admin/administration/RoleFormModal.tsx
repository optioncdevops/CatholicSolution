import { useState } from 'react';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { Dropdown, InputField, TextareaField } from '@app/components/formControls';
import type { AdminRole } from '../types';

const LANDING_PAGES = ['Dashboard', 'Products', 'Organizations', 'Users', 'Requests'];

interface RoleFormValue {
  name: string;
  description: string;
  landingPage: string;
}

const EMPTY_FORM: RoleFormValue = { name: '', description: '', landingPage: LANDING_PAGES[0] };

interface RoleFormModalProps {
  /** `null` = closed. `'create'` = new role. An `AdminRole` = edit/view that role. */
  target: 'create' | AdminRole | null;
  readOnly?: boolean;
  onClose: () => void;
  onCreate: (value: RoleFormValue) => void;
  onSave: (role: AdminRole) => void;
}

export function RoleFormModal({ target, readOnly = false, onClose, onCreate, onSave }: RoleFormModalProps) {
  const isCreate = target === 'create';
  const editing = target && target !== 'create' ? target : null;
  const [form, setForm] = useState<RoleFormValue>(EMPTY_FORM);
  const [touched, setTouched] = useState(false);
  const [lastTargetKey, setLastTargetKey] = useState<string | null>(null);

  const targetKey = isCreate ? 'create' : (editing?.id ?? null);
  if (targetKey !== lastTargetKey) {
    // Reset the form whenever a different role opens for edit/view, or the modal opens fresh for create.
    // (Adjusted during render, matching this codebase's convention — see AccountModals.tsx.)
    setForm(editing ? { name: editing.name, description: editing.description, landingPage: editing.landingPage } : EMPTY_FORM);
    setTouched(false);
    setLastTargetKey(targetKey);
  }

  if (!target) return null;

  const nameError = touched && !form.name.trim() ? 'Role name is required.' : undefined;
  const hasErrors = Boolean(nameError);

  const update = <K extends keyof RoleFormValue>(key: K, value: RoleFormValue[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setTouched(true);
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!form.name.trim()) return;
    if (isCreate) onCreate(form);
    else if (editing) onSave({ ...editing, ...form });
  };

  const title = readOnly ? 'View Role' : isCreate ? 'Add User Role' : 'Edit User Role';

  return (
    <BaseModal
      isOpen={Boolean(target)}
      onClose={onClose}
      title={title}
      size="sm"
      showMandatory={!readOnly}
      autoFocus={!readOnly}
      footer={readOnly ? (
        <CommonButton variant="outline" onClick={onClose}>Close</CommonButton>
      ) : (
        <>
          <CommonButton variant="outline" onClick={onClose}>Cancel</CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit} disabled={hasErrors}>Save</CommonButton>
        </>
      )}
    >
      <form onSubmit={(event) => { event.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4" noValidate>
        <InputField label="Role name" required={!readOnly} value={form.name} onChange={(event) => update('name', event.target.value)} error={nameError} disabled={readOnly} />
        <TextareaField label="Description" value={form.description} onChange={(event) => update('description', event.target.value)} rows={3} showCharCount={false} disabled={readOnly} />
        <Dropdown
          label="Landing page" searchable={false} clearable={false}
          value={form.landingPage}
          onValueChange={(value) => update('landingPage', value ?? LANDING_PAGES[0])}
          options={LANDING_PAGES.map((page) => ({ id: page, value: page }))}
          disabled={readOnly}
        />
      </form>
    </BaseModal>
  );
}

export type { RoleFormValue };
