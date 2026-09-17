/** Read-only label/value pair used across detail panels and drawers (products, customers, invoices). */
export function DetailField({ label, value, wrap = false, className = '' }: { label: string; value: string; wrap?: boolean; className?: string }) {
  return (
    <div className={`rounded-[var(--radius-control)] border border-[var(--line-soft)] p-3 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
      <p className={`mt-1 text-sm font-bold text-[var(--text-primary)] ${wrap ? 'break-words' : 'truncate'}`}>{value || '—'}</p>
    </div>
  );
}
