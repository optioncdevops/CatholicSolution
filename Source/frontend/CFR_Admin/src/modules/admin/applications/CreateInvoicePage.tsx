import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Layers, Minus, Plus, Save, X } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { DatePicker, Dropdown, InputField, MandatoryIndicator, RichTextEditor } from '@app/components/formControls';
import { CustomDynamicDataTable, type CustomDynamicDataTableColumn } from '@app/components/dataTable/CustomDynamicDataTable';
import { useAdminData } from '../AdminDataContext';
import { confirmAction } from '../lib/confirm';
import { BulkAddLineItemsDialog } from './BulkAddLineItemsDialog';
import type { Invoice, InvoiceStatus } from '../types';

const STATUS_OPTIONS: Array<{ id: InvoiceStatus; value: string }> = [
  { id: 'created', value: 'Created' },
  { id: 'paid', value: 'Paid' },
  { id: 'cancelled', value: 'Cancelled' },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function inDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

interface LineItem {
  key: string;
  itemId: string;
  description: string;
  unitCost: number;
  quantity: number;
}

let lineItemSeq = 0;
function newLineItem(overrides: Partial<LineItem> = {}): LineItem {
  lineItemSeq += 1;
  return { key: `row-${lineItemSeq}`, itemId: '', description: '', unitCost: 0, quantity: 1, ...overrides };
}

/** Full-page invoice creation — replaces the old drawer with a dedicated page laid out like a
 * standard SaaS billing form: header fields, a custom message, an itemized line-item builder
 * (the shared dynamic data-table grid), and a sticky total. */
export function CreateInvoicePage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { getApplication, organizations, invoiceItems, addInvoice } = useAdminData();
  const { showToast } = useToast();

  const app = appId ? getApplication(appId) : undefined;
  const invoiceTabPath = `/admin/applications/${appId}`;

  const productCustomers = organizations.filter((org) => org.appIds.includes(appId ?? ''));
  // Only items scoped to this product, plus generic (no appId) items available to every product —
  // an invoice for OptionC School shouldn't offer a Matt Money-specific line item.
  const activeItems = invoiceItems.filter((item) => item.active && (!item.appId || item.appId === appId));

  const [title, setTitle] = useState(app ? `${app.name} — Invoice` : '');
  const [orgId, setOrgId] = useState(productCustomers[0]?.id ?? '');
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate, setDueDate] = useState(inDays(14));
  const [status, setStatus] = useState<InvoiceStatus>('created');
  const [customMessage, setCustomMessage] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([newLineItem()]);
  const [touched, setTouched] = useState(false);
  const [bulkAddOpen, setBulkAddOpen] = useState(false);

  if (!app || !appId) return <Navigate to="/admin/applications" replace />;

  const subTotal = lineItems.reduce((sum, row) => sum + row.unitCost * row.quantity, 0);
  const hasErrors = !title.trim() || !orgId || !invoiceDate || !dueDate || lineItems.length === 0 || subTotal <= 0;

  const updateRow = (key: string, patch: Partial<LineItem>) => {
    setLineItems((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };
  const handleSelectItem = (key: string, itemId: string) => {
    const item = activeItems.find((candidate) => candidate.id === itemId);
    updateRow(key, { itemId, description: item?.title ?? '', unitCost: item?.defaultAmount ?? 0 });
  };

  const handleBulkAdd = (selections: Array<{ item: (typeof activeItems)[number]; quantity: number }>) => {
    const bulkRows = selections.map(({ item, quantity }) =>
      newLineItem({ itemId: item.id, description: item.title, unitCost: item.defaultAmount, quantity }));
    setLineItems((current) => {
      const isBlankStarterRow = current.length === 1 && !current[0].itemId && !current[0].description && current[0].unitCost === 0;
      return isBlankStarterRow ? bulkRows : [...current, ...bulkRows];
    });
    showToast(`Added ${bulkRows.length} item${bulkRows.length === 1 ? '' : 's'} to the invoice ✓`);
  };

  const lineItemColumns: CustomDynamicDataTableColumn<LineItem>[] = [
    {
      key: 'description', header: 'Description', controlType: 'custom',
      renderEditor: ({ row }) => (
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
          <div className="w-full shrink-0 sm:w-44">
            <Dropdown
              label="Item" hideLabel searchable={false} clearable={false}
              value={row.itemId || undefined}
              onValueChange={(value) => handleSelectItem(row.key, value ?? '')}
              options={activeItems.map((item) => ({ id: item.id, value: item.title }))}
              className="min-h-8"
            />
          </div>
          <InputField
            label="Description" hideLabel
            value={row.description}
            onChange={(event) => updateRow(row.key, { description: event.target.value })}
            placeholder="Description"
            className="min-h-8 text-xs"
          />
        </div>
      ),
    },
    {
      key: 'unitCost', header: 'Unit Cost', widthClassName: 'w-36', align: 'right', controlType: 'custom',
      renderEditor: ({ row }) => (
        <InputField
          label="Unit cost" hideLabel type="number" min={0} step="0.01"
          value={row.unitCost}
          onChange={(event) => updateRow(row.key, { unitCost: Number(event.target.value) || 0 })}
          className="min-h-8 text-right text-xs"
        />
      ),
    },
    {
      key: 'quantity', header: 'Quantity', widthClassName: 'w-32', align: 'center', controlType: 'custom',
      renderEditor: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <CommonIconButton
            aria-label={`Decrease quantity for ${row.description || 'this item'}`}
            variant="secondary" size="xs" icon={<Minus size={12} />}
            disabled={row.quantity <= 1}
            onClick={() => updateRow(row.key, { quantity: Math.max(1, row.quantity - 1) })}
          />
          <span className="w-6 text-center text-xs font-bold text-[var(--text-primary)]">{row.quantity}</span>
          <CommonIconButton
            aria-label={`Increase quantity for ${row.description || 'this item'}`}
            variant="secondary" size="xs" icon={<Plus size={12} />}
            onClick={() => updateRow(row.key, { quantity: row.quantity + 1 })}
          />
        </div>
      ),
    },
    {
      key: 'cost', header: 'Cost', widthClassName: 'w-28', align: 'right', readOnly: true, readOnlyDisplay: 'text',
      renderValue: (row) => `$${(row.unitCost * row.quantity).toFixed(2)}`,
    },
  ];

  const handleCancel = async () => {
    const dirty = touched || lineItems.some((row) => row.description || row.unitCost > 0);
    if (dirty) {
      const confirmed = await confirmAction({
        title: 'Discard this invoice?',
        description: 'You have unsaved invoice details. Leaving now will discard them.',
        confirmLabel: 'Discard invoice',
        tone: 'danger',
      });
      if (!confirmed) return;
    }
    navigate(invoiceTabPath);
  };

  const handleSubmit = () => {
    setTouched(true);
    if (hasErrors) return;
    const invoice: Omit<Invoice, 'id' | 'invoiceNumber'> = {
      orgId,
      appId,
      title: title.trim(),
      invoiceDate,
      dueDate,
      amount: subTotal,
      quantity: 1,
      status,
      customMessage: customMessage.trim() || undefined,
      paymentLink: paymentLink.trim() || undefined,
    };
    addInvoice(invoice);
    showToast('Invoice created ✓ (prototype only, not persisted)');
    navigate(invoiceTabPath);
  };

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader breadcrumb={{ label: app.name, to: invoiceTabPath }} title="Create Invoice" action={<MandatoryIndicator variant="brand" />} />

      {productCustomers.length === 0 ? (
        <section className="admin-panel-card p-4">
          <p className="text-sm text-[var(--text-muted)]">This product has no customers to invoice yet — assign it to an organization first.</p>
        </section>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); handleSubmit(); }} noValidate className="flex flex-col gap-3">
          <section className="admin-panel-card overflow-hidden">
            <div className="flex flex-col divide-y divide-[var(--line-soft)]">
              <div>
                <div className="admin-panel-card__header"><h2 className="panel-title">Invoice Details</h2></div>
                <div className="grid gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-4">
                  <InputField
                    label="Title" required
                    value={title}
                    onChange={(event) => { setTitle(event.target.value); setTouched(true); }}
                    error={touched && !title.trim() ? 'Enter an invoice title.' : undefined}
                    wrapperClassName="lg:col-span-2"
                  />
                  <Dropdown
                    label="Customer" required
                    value={orgId}
                    onValueChange={(value) => { setOrgId(value ?? ''); setTouched(true); }}
                    options={productCustomers.map((org) => ({ id: org.id, value: `${org.name} (${org.code})` }))}
                    searchable={false}
                    clearable={false}
                    error={touched && !orgId ? 'Select a customer.' : undefined}
                  />
                  <Dropdown
                    label="Status" required
                    value={status}
                    onValueChange={(value) => setStatus((value as InvoiceStatus) ?? 'created')}
                    options={STATUS_OPTIONS}
                    searchable={false}
                    clearable={false}
                  />
                  <DatePicker
                    label="Invoice Date" required
                    value={invoiceDate}
                    outputFormat="yyyy-MM-dd" displayFormat="MM/dd/yyyy"
                    onChange={(value) => { setInvoiceDate(value); setTouched(true); }}
                  />
                  <DatePicker
                    label="Due Date" required
                    value={dueDate}
                    outputFormat="yyyy-MM-dd" displayFormat="MM/dd/yyyy"
                    onChange={(value) => { setDueDate(value); setTouched(true); }}
                  />
                  <InputField
                    label="Payment Link"
                    value={paymentLink}
                    onChange={(event) => setPaymentLink(event.target.value)}
                    placeholder="https://…"
                    wrapperClassName="lg:col-span-2"
                  />
                </div>
              </div>

              <div>
                <div className="admin-panel-card__header flex items-center justify-between gap-2">
                  <h2 className="panel-title">Line Items</h2>
                  <CommonButton variant="outline" size="sm" iconLeft={<Layers size={13} />} onClick={() => setBulkAddOpen(true)}>Bulk Add Items</CommonButton>
                </div>
                <CustomDynamicDataTable
                  columns={lineItemColumns}
                  rows={lineItems}
                  getRowId={(row) => row.key}
                  createEmptyRow={newLineItem}
                  onRowsChange={setLineItems}
                  minRows={1}
                  showAddOnlyOnLastRow
                  addButtonLabel="Add Item"
                  emptyMessage="No line items yet."
                />
                <div className="flex items-center justify-end gap-3 border-t border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Sub Total</span>
                  <span className="text-base font-extrabold text-[var(--text-primary)]">${subTotal.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <div className="admin-panel-card__header"><h2 className="panel-title">Custom Message</h2></div>
                <div className="p-3">
                  <RichTextEditor label="Custom Message" hideLabel value={customMessage} onChange={setCustomMessage} />
                </div>
              </div>
            </div>
          </section>

          <div className="admin-sticky-footer">
            <CommonButton variant="outline" iconLeft={<X size={14} />} onClick={() => void handleCancel()}>Cancel</CommonButton>
            <CommonButton variant="primary" iconLeft={<Save size={14} />} onClick={handleSubmit} disabled={hasErrors}>Save</CommonButton>
          </div>
        </form>
      )}

      <BulkAddLineItemsDialog
        open={bulkAddOpen}
        items={activeItems}
        onClose={() => setBulkAddOpen(false)}
        onAdd={handleBulkAdd}
      />
    </div>
  );
}
