import { DetailField } from '@app/components/DetailField';
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

export function ProductDetailsTab({ app }: { app: AdminApplication }) {
  return (
    <div className="flex flex-col gap-4">
      <section className="admin-panel-card">
        <div className="admin-panel-card__header"><h2 className="panel-title">Description</h2></div>
        <div className="p-4">
          <p className="text-[0.8125rem] leading-6 text-[var(--text-secondary)]">{app.description || 'No description yet.'}</p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DetailField label="Category" value={app.category} />
        <DetailField label="Status" value={app.status.replace('-', ' ')} />
        <DetailField label="Production domain" value={domainOf(app.productionUrl)} />
        <DetailField label="Visibility" value={app.visibility} />
        <DetailField label="Last updated" value={formatDate(app.updatedAt)} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="admin-panel-card">
          <div className="admin-panel-card__header"><h2 className="panel-title">Features</h2></div>
          {app.features.length === 0 ? (
            <p className="p-4 text-xs text-[var(--text-muted)]">No features listed.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5 p-4">
              {app.features.map((feature) => <li key={feature} className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">{feature}</li>)}
            </ul>
          )}
        </section>
        <section className="admin-panel-card">
          <div className="admin-panel-card__header"><h2 className="panel-title">Integrations</h2></div>
          {app.integrations.length === 0 ? (
            <p className="p-4 text-xs text-[var(--text-muted)]">No integrations listed.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5 p-4">
              {app.integrations.map((integration) => <li key={integration} className="rounded-full bg-[var(--info-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--info)]">{integration}</li>)}
            </ul>
          )}
        </section>
      </div>

      <section className="admin-panel-card">
        <div className="admin-panel-card__header">
          <div>
            <h2 className="panel-title">Product preview</h2>
            <p className="panel-subtitle">How this product appears in the catalog.</p>
          </div>
        </div>
        <div className="p-4">
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
      </section>
    </div>
  );
}
