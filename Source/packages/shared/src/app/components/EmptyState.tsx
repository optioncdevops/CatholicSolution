interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="px-5 py-14 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-50 text-3xl" aria-hidden="true">{icon}</span>
      <h3 className="mt-4 font-display text-lg font-extrabold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="mt-5 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-rose-200 transition hover:brightness-105">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
