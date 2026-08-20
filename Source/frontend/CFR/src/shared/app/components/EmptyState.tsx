interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="empty-state px-5 py-10 text-center" role="status">
      <span className="empty-state__icon mx-auto grid size-12 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] text-2xl" aria-hidden="true">{icon}</span>
      <h3 className="mt-3 font-display text-base font-bold text-[var(--text-primary)]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-[0.8125rem] leading-6 text-[var(--text-muted)]">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="action-primary mt-4 rounded-[var(--radius-control)] px-4 py-2 text-xs font-bold text-white">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
