import { StatusBadge } from '@app/components/Badge';
import { formatDate } from '../utils/formatDate';
import type { AdminApplication } from '../types';

function domainOf(url: string): string {
  if (!url.trim()) return 'Not configured';
  try {
    return new URL(url).hostname;
  } catch {
    return 'Not configured';
  }
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
      <p className="mt-0.5 truncate text-[0.8125rem] font-bold capitalize text-[var(--text-primary)]">{value || '—'}</p>
    </div>
  );
}

/** One consolidated panel instead of five separate cards — same information, less chrome. */
export function ProductDetailsTab({ app }: { app: AdminApplication }) {
  return (
    <section className="admin-panel-card">
      <div className="admin-panel-card__header"><h2 className="panel-title">Product Details</h2></div>

      <div className="flex flex-col divide-y divide-[var(--line-soft)]">
        <div className="p-4">
          <p className="text-[0.8125rem] leading-6 text-[var(--text-secondary)]">{app.description || 'No description yet.'}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
          <Fact label="Category" value={app.category} />
          <Fact label="Status" value={app.status.replace('-', ' ')} />
          <Fact label="Production domain" value={domainOf(app.productionUrl)} />
          <Fact label="Visibility" value={app.visibility} />
          <Fact label="Last updated" value={formatDate(app.updatedAt)} />
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Features</p>
            {app.features.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No features listed.</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {app.features.map((feature) => <li key={feature} className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">{feature}</li>)}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Integrations</p>
            {app.integrations.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No integrations listed.</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {app.integrations.map((integration) => <li key={integration} className="rounded-full bg-[var(--info-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--info)]">{integration}</li>)}
              </ul>
            )}
          </div>
        </div>

        <div className="p-4">
          <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Product Preview</p>
          <div className="admin-product-card max-w-xs" style={{ cursor: 'default' }}>
            <div className="flex items-start justify-between gap-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg text-sm text-white" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
              <StatusBadge status={app.status} kind="application" />
            </div>
            <div className="mt-2 min-w-0">
              <span className="block truncate text-sm font-extrabold text-[var(--text-primary)]">{app.name}</span>
              <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">{app.category}</span>
            </div>
            <p className="admin-product-card__description">{app.description || 'No description yet.'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
