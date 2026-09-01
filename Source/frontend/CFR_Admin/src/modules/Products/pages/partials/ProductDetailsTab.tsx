import { formatDate } from '@/modules/utils/formatDate';
import { ProductCard } from './ProductCard';
import type { AdminApplication } from '@/modules/types';

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
      <p className="mt-0.5 truncate text-[0.8125rem] font-bold capitalize text-[var(--text-primary)]">{value || '—'}</p>
    </div>
  );
}

function WebsiteUrlFact({ url }: { url: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Website URL</p>
      {url.trim() ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-0.5 block truncate text-[0.8125rem] font-bold text-[var(--primary)] hover:underline">{url}</a>
      ) : (
        <p className="mt-0.5 truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">Not configured</p>
      )}
    </div>
  );
}

export function ProductDetailsTab({ app }: { app: AdminApplication }) {
  return (
    <section className="admin-panel-card">
      <div className="admin-panel-card__header"><h2 className="panel-title">Product Details</h2></div>

      <div className="flex flex-col divide-y divide-[var(--line-soft)]">
        <div className="p-4">
          <p className="text-[0.8125rem] leading-6 text-[var(--text-secondary)]">{app.description || 'No description yet.'}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3 p-4 sm:grid-cols-3 lg:grid-cols-5">
          <Fact label="Product Subtitle" value={app.category} />
          <Fact label="Status" value={app.status.replace('-', ' ')} />
          <WebsiteUrlFact url={app.productionUrl} />
          <Fact label="License Type" value={app.licenseType} />
          <Fact label="Last updated" value={formatDate(app.updatedAt)} />
        </div>

        <div className="p-4">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Features</p>
          {app.features.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">No features listed.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {app.features.map((feature) => <li key={feature} className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">{feature}</li>)}
            </ul>
          )}
        </div>

        <div className="p-4">
          <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Product Preview</p>
          <ProductCard app={app} className="max-w-xs" />
        </div>
      </div>
    </section>
  );
}
