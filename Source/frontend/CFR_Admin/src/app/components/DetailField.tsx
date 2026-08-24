/** Read-only label/value pair used across detail panels and drawers (products, customers, invoices). */
export function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--line-soft)] p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-[var(--text-primary)]">{value || '—'}</p>
    </div>
  );
}
