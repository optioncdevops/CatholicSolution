import { useState } from 'react';
import { CommonButton } from '@app/components/buttons';
import { Drawer } from '@app/components/Drawer';
import { Dropdown, InputField, MandatoryIndicator, TextareaField } from '@app/components/formControls';
import { useAdminData } from '../AdminDataContext';
import type { InvoiceItem } from '../types';

const ALL_PRODUCTS_OPTION = 'all-products';

export interface InvoiceItemFormValue {
  title: string;
  description: string;
  defaultAmount: number;
  appId?: string;
}

const EMPTY_FORM: InvoiceItemFormValue = { title: '', description: '', defaultAmount: 0, appId: undefined };

interface InvoiceItemFormDrawerProps {
  /** `null` = closed. `'create'` = new item. An `InvoiceItem` = edit that item. */
  target: 'create' | InvoiceItem | null;
  onClose: () => void;
  onCreate: (value: InvoiceItemFormValue) => void;
  onSave: (item: InvoiceItem) => void;
}

export function InvoiceItemFormDrawer({ target, onClose, onCreate, onSave }: InvoiceItemFormDrawerProps) {
  const { applications } = useAdminData();
  const isCreate = target === 'create';
  const editing = target && target !== 'create' ? target : null;
  const [form, setForm] = useState<InvoiceItemFormValue>(EMPTY_FORM);
  const [lastTargetKey, setLastTargetKey] = useState<string | null>(null);

  const targetKey = isCreate ? 'create' : (editing?.id ?? null);
  if (targetKey !== lastTargetKey) {
    // Reset the form whenever a different item opens for edit, or the drawer opens fresh for create.
    // (Adjusted during render — this codebase's convention — see AccountModals.tsx.)
    setForm(editing ? { title: editing.title, description: editing.description, defaultAmount: editing.defaultAmount, appId: editing.appId } : EMPTY_FORM);
    setLastTargetKey(targetKey);
  }

  if (!target) return null;

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (isCreate) onCreate(form);
    else if (editing) onSave({ ...editing, ...form });
  };

  return (
    <Drawer
      open={Boolean(target)}
      title={isCreate ? 'Add Invoice Item' : 'Edit Invoice Item'}
      description={editing?.title}
      onClose={onClose}
      footer={(
        <>
          <CommonButton variant="outline" onClick={onClose}>Cancel</CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit} disabled={!form.title.trim()}>Save</CommonButton>
        </>
      )}
    >
      <div className="flex flex-col gap-3.5">
        <MandatoryIndicator align="end" />
        <InputField label="Title" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <TextareaField label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} showCharCount={false} />
        <InputField label="Default amount (USD)" type="number" value={form.defaultAmount} onChange={(event) => setForm({ ...form, defaultAmount: Number(event.target.value) || 0 })} />
        <Dropdown
          label="Product" searchable={false} clearable={false}
          value={form.appId ?? ALL_PRODUCTS_OPTION}
          onValueChange={(value) => setForm({ ...form, appId: value === ALL_PRODUCTS_OPTION ? undefined : value })}
          options={[{ id: ALL_PRODUCTS_OPTION, value: 'All Products (Generic)' }, ...applications.map((app) => ({ id: app.id, value: app.name }))]}
          helperText="Scopes this item to one product's invoices, or leave as a generic item available everywhere."
        />
      </div>
    </Drawer>
  );
}
