import { useState } from 'react';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { Dropdown, InputField, TextareaField } from '@app/components/formControls';
import { useAdminData } from '../AdminDataContext';
import type { InvoiceItem } from '../types';

export interface InvoiceItemFormValue {
  title: string;
  description: string;
  defaultAmount: number;
  appId: string;
}

const EMPTY_FORM: InvoiceItemFormValue = { title: '', description: '', defaultAmount: 0, appId: '' };

interface InvoiceItemFormModalProps {
  /** `null` = closed. `'create'` = new item. An `InvoiceItem` = edit that item. */
  target: 'create' | InvoiceItem | null;
  onClose: () => void;
  onCreate: (value: InvoiceItemFormValue) => void;
  onSave: (item: InvoiceItem) => void;
}

export function InvoiceItemFormModal({ target, onClose, onCreate, onSave }: InvoiceItemFormModalProps) {
  const { applications } = useAdminData();
  const isCreate = target === 'create';
  const editing = target && target !== 'create' ? target : null;
  const [form, setForm] = useState<InvoiceItemFormValue>(EMPTY_FORM);
  const [lastTargetKey, setLastTargetKey] = useState<string | null>(null);

  const targetKey = isCreate ? 'create' : (editing?.id ?? null);
  if (targetKey !== lastTargetKey) {
    // Reset the form whenever a different item opens for edit, or the modal opens fresh for create.
    // (Adjusted during render — this codebase's convention — see AccountModals.tsx.)
    setForm(editing ? { title: editing.title, description: editing.description, defaultAmount: editing.defaultAmount, appId: editing.appId } : { ...EMPTY_FORM, appId: applications[0]?.id ?? '' });
    setLastTargetKey(targetKey);
  }

  if (!target) return null;

  const hasErrors = !form.title.trim() || !form.appId;

  const handleSubmit = () => {
    if (hasErrors) return;
    if (isCreate) onCreate(form);
    else if (editing) onSave({ ...editing, ...form });
  };

  return (
    <BaseModal
      isOpen={Boolean(target)}
      onClose={onClose}
      title={isCreate ? 'Add License Item' : 'Edit License Item'}
      size="sm"
      showMandatory
      footer={(
        <>
          <CommonButton variant="outline" onClick={onClose}>Cancel</CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit} disabled={hasErrors}>Save</CommonButton>
        </>
      )}
    >
      <div className="flex flex-col gap-3.5">
        {editing ? <p className="-mt-2 text-xs text-[var(--text-muted)]">{editing.title}</p> : null}
        <InputField label="Title" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <TextareaField label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} showCharCount={false} />
        <InputField label="Default amount (USD)" type="number" value={form.defaultAmount} onChange={(event) => setForm({ ...form, defaultAmount: Number(event.target.value) || 0 })} />
        <Dropdown
          label="Product" required searchable={false} clearable={false}
          value={form.appId}
          onValueChange={(value) => setForm({ ...form, appId: value ?? '' })}
          options={applications.map((app) => ({ id: app.id, value: app.name }))}
          disabled={!isCreate}
          helperText={isCreate ? "Scopes this item to one product's licenses." : 'The product cannot be changed after an item is created.'}
        />
      </div>
    </BaseModal>
  );
}
