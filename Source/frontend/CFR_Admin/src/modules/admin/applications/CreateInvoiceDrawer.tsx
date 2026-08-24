import { useState } from 'react';
import { CommonButton } from '@app/components/buttons';
import { Drawer } from '@app/components/Drawer';
import { InputField, Dropdown } from '@app/components/formControls';
import { useAdminData } from '../AdminDataContext';
import type { AdminApplication, Invoice, Organization } from '../types';

interface CreateInvoiceDrawerProps {
  open: boolean;
  app: AdminApplication;
  customers: Organization[];
  onClose: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function inDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

export function CreateInvoiceDrawer({ open, app, customers, onClose }: CreateInvoiceDrawerProps) {
  const { invoiceItems, addInvoice } = useAdminData();
  const activeItems = invoiceItems.filter((item) => item.active);

  const emptyForm = {
    orgId: customers[0]?.id ?? '',
    itemId: activeItems[0]?.id ?? '',
    amount: activeItems[0]?.defaultAmount ?? 0,
    quantity: 1,
    invoiceDate: today(),
    dueDate: inDays(14),
  };
  const [form, setForm] = useState(emptyForm);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    // Reset the form each time the drawer opens fresh (adjusted during render, per this
    // codebase's convention — see AccountModals.tsx).
    if (open) setForm(emptyForm);
    setWasOpen(open);
  }

  const hasErrors = !form.orgId || !form.invoiceDate || !form.dueDate || form.amount <= 0 || form.quantity <= 0;

  const handleSelectItem = (itemId: string) => {
    const item = activeItems.find((candidate) => candidate.id === itemId);
    setForm((current) => ({ ...current, itemId, amount: item?.defaultAmount ?? current.amount }));
  };

  const handleSubmit = () => {
    if (hasErrors) return;
    const invoice: Omit<Invoice, 'id' | 'invoiceNumber'> = {
      orgId: form.orgId,
      appId: app.id,
      invoiceDate: form.invoiceDate,
      dueDate: form.dueDate,
      amount: form.amount,
      quantity: form.quantity,
      status: 'created',
    };
    addInvoice(invoice);
    onClose();
  };

  return (
    <Drawer
      open={open}
      title="Create invoice"
      description={app.name}
      onClose={onClose}
      footer={(
        <>
          <CommonButton variant="outline" onClick={onClose}>Cancel</CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit} disabled={hasErrors}>Create invoice</CommonButton>
        </>
      )}
    >
      {customers.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">This product has no customers to invoice yet — assign it to an organization first.</p>
      ) : (
        <div className="flex flex-col gap-3.5">
          <Dropdown
            label="Customer"
            value={form.orgId}
            onValueChange={(value) => setForm((current) => ({ ...current, orgId: value ?? '' }))}
            options={customers.map((org) => ({ id: org.id, value: `${org.name} (${org.code})` }))}
            searchable={false}
            clearable={false}
          />
          <Dropdown
            label="Invoice item"
            value={form.itemId}
            onValueChange={(value) => handleSelectItem(value ?? '')}
            options={activeItems.map((item) => ({ id: item.id, value: item.title }))}
            searchable={false}
            clearable={false}
            helperText={activeItems.length === 0 ? 'No active invoice items — add one under Administration → Invoice items.' : undefined}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Amount (USD)" type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) || 0 }))} />
            <InputField label="Quantity" type="number" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) || 0 }))} />
            <InputField label="Invoice date" type="date" value={form.invoiceDate} onChange={(event) => setForm((current) => ({ ...current, invoiceDate: event.target.value }))} />
            <InputField label="Due date" type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
          </div>
          <p className="text-xs text-[var(--text-faint)]">Preview only — this prototype has no real billing system.</p>
        </div>
      )}
    </Drawer>
  );
}
