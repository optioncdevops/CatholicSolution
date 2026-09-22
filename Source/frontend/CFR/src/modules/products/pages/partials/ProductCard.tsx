import type { CatalogApp } from '@shared/app/types/app';
import { ProductLogoIcon } from '@shared/app/components/ProductLogoIcon';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';

interface ProductCardProps {
  app: CatalogApp;
  onDetails: (app: CatalogApp) => void;
}

export function ProductCard({ app, onDetails }: ProductCardProps) {
  const comingSoon = app.hubSection === 'future';
  const canRequest = !comingSoon && Boolean(app.canRequest);
  const statusClass = comingSoon ? 'hub-module-card__status--coming-soon' : 'hub-module-card__status--available';

  return (
    <article className="hub-module-card hub-module-card--catalog group">
      <span className="hub-module-card__accent" style={{ background: app.gradient }} aria-hidden="true" />
      <span className="hub-module-card__wash" style={{ background: app.gradient }} aria-hidden="true" />
      <div className="hub-module-card__top">
        <ProductLogoIcon app={app} className="hub-module-card__icon" />
        <h3 className="hub-module-card__name" title={app.name}>{app.name}</h3>
      </div>
      <div className="hub-module-card__meta">
        <span className="hub-module-card__category" title={app.category}>{app.category}</span>
        <span className={`hub-module-card__status ${statusClass}`}>{comingSoon ? 'Coming soon' : app.statusLabel}</span>
      </div>
      <div className="hub-module-card__content">
        <p>{app.description}</p>
      </div>
      <div className="hub-card-actions hub-card-actions--catalog">
        {canRequest ? (
          <PlatformLink to={`/request-access?product=${encodeURIComponent(app.id)}`} className="hub-card-action hub-card-action--primary">
            <span>Request access</span>
            <span aria-hidden="true">→</span>
          </PlatformLink>
        ) : comingSoon ? (
          <span className="hub-card-action hub-card-action--muted">Coming soon</span>
        ) : null}
        <button type="button" onClick={() => onDetails(app)} className="hub-card-action hub-card-action--secondary-on-light">
          <span aria-hidden="true">ⓘ</span><span>Details</span>
        </button>
      </div>
    </article>
  );
}
