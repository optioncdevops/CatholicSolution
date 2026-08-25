import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus } from 'lucide-react';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import type { InvoiceItem } from '../types';

interface BulkAddLineItemsDialogProps {
  open: boolean;
  items: InvoiceItem[];
  onClose: () => void;
  onAdd: (selections: Array<{ item: InvoiceItem; quantity: number }>) => void;
}

/** Lets the user check off several master invoice items at once — with a quantity each — and
 * drop them all into the line-items table in one action, instead of repeating Add Item one row
 * at a time. Follows this app's hand-rolled portal-dialog convention (see ProductStatusDialog). */
export function BulkAddLineItemsDialog({ open, items, onClose, onAdd }: BulkAddLineItemsDialogProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [wasOpen, setWasOpen] = useState(open);
  const firstCheckboxRef = useRef<HTMLInputElement | null>(null);

  if (open !== wasOpen) {
    if (open) setQuantities({});
    setWasOpen(open);
  }

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    firstCheckboxRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previousFocus?.focus(); };
  }, [open, onClose]);

  if (!open) return null;

  const selectedCount = Object.keys(quantities).length;

  const toggleItem = (itemId: string, checked: boolean) => {
    setQuantities((current) => {
      const next = { ...current };
      if (checked) next[itemId] = next[itemId] ?? 1;
      else delete next[itemId];
      return next;
    });
  };

  const changeQuantity = (itemId: string, quantity: number) => {
    setQuantities((current) => ({ ...current, [itemId]: Math.max(1, quantity) }));
  };

  const handleAdd = () => {
    const selections = items
      .filter((item) => quantities[item.id] !== undefined)
      .map((item) => ({ item, quantity: quantities[item.id] }));
    if (selections.length === 0) return;
    onAdd(selections);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] grid place-items-center bg-black/40 p-4 motion-safe:animate-[fade-in_120ms_ease-out]" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-add-items-title"
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-elevated)] motion-safe:animate-[pop-in_140ms_ease-out]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="border-b border-[var(--line)] p-5 pb-4">
          <h2 id="bulk-add-items-title" className="font-display text-base font-extrabold text-[var(--text-primary)]">Bulk Add Items</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Select the items to add to this invoice, then set a quantity for each.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pt-4">
          {items.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No active invoice items available.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {items.map((item, index) => {
                const checked = quantities[item.id] !== undefined;
                return (
                  <li key={item.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${checked ? 'border-[var(--primary)] bg-[var(--primary-muted)]' : 'border-[var(--line)]'}`}>
                    <input
                      ref={index === 0 ? firstCheckboxRef : undefined}
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => toggleItem(item.id, event.target.checked)}
                      className="size-4 shrink-0 accent-[var(--primary)]"
                      aria-label={`Select ${item.title}`}
                    />
                    <label className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleItem(item.id, !checked)}>
                      <span className="block truncate text-sm font-bold text-[var(--text-primary)]">{item.title}</span>
                      <span className="block truncate text-xs text-[var(--text-muted)]">${item.defaultAmount.toFixed(2)} each</span>
                    </label>
                    {checked ? (
                      <div className="flex shrink-0 items-center gap-1.5" onMouseDown={(event) => event.stopPropagation()}>
                        <CommonIconButton
                          aria-label={`Decrease quantity for ${item.title}`}
                          variant="secondary" size="xs" icon={<Minus size={12} />}
                          disabled={quantities[item.id] <= 1}
                          onClick={() => changeQuantity(item.id, quantities[item.id] - 1)}
                        />
                        <span className="w-5 text-center text-xs font-bold text-[var(--text-primary)]">{quantities[item.id]}</span>
                        <CommonIconButton
                          aria-label={`Increase quantity for ${item.title}`}
                          variant="secondary" size="xs" icon={<Plus size={12} />}
                          onClick={() => changeQuantity(item.id, quantities[item.id] + 1)}
                        />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--line)] p-5 pt-4">
          <CommonButton variant="outline" onClick={onClose}>Cancel</CommonButton>
          <CommonButton variant="primary" disabled={selectedCount === 0} onClick={handleAdd}>
            Add Selected{selectedCount > 0 ? ` (${selectedCount})` : ''}
          </CommonButton>
        </div>
      </section>
    </div>,
    document.body,
  );
}
