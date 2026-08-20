import { StatusBadge } from '../components/Badge';
import type { AdminApplication } from '../types';

export function ApplicationPreviewCard({ app }: { app: AdminApplication }) {
  return (
    <article className="w-full max-w-xs rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl text-xl text-white" style={{ background: app.gradient || 'var(--primary)' }} aria-hidden="true">
          {app.icon || '📦'}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-sm font-extrabold text-[var(--text-primary)]">{app.name || 'Untitled application'}</h3>
          <p className="truncate text-xs text-[var(--text-muted)]">{app.category || 'Uncategorized'}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-[0.8125rem] leading-6 text-[var(--text-secondary)]">{app.description || 'No description yet.'}</p>
      {app.features.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {app.features.slice(0, 4).map((feature) => (
            <li key={feature} className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[0.6875rem] font-semibold text-[var(--text-secondary)]">{feature}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-3 flex items-center justify-between">
        <StatusBadge status={app.status} kind="application" />
        <span className="text-[0.6875rem] font-semibold text-[var(--text-faint)] capitalize">{app.visibility}</span>
      </div>
    </article>
  );
}
