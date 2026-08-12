import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import type { CatalogApp } from '@shared/app/types/app';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';
import { resolveAppUrl } from '@shared/platform/navigation/solutionNavigation';

interface AppCardProps {
  app: CatalogApp;
  onDetails: (app: CatalogApp) => void;
}

type CardMode = 'launchable' | 'external' | 'unavailable' | 'catalog';

function resolveMode(app: CatalogApp): CardMode {
  if (app.route) return 'launchable';
  if (app.kind !== 'external') return 'catalog';
  return app.externalUrl ? 'external' : 'unavailable';
}

export function AppCard({ app, onDetails }: AppCardProps) {
  const mode = resolveMode(app);
  const activatable = mode === 'launchable' || mode === 'external';
  const workspaceCard = mode !== 'catalog';
  const target = mode === 'launchable' ? resolveAppUrl(app) : app.externalUrl;
  const actionVerb = mode === 'launchable' ? 'Launch' : 'Open';
  const themedActionStyle = { '--hub-action-theme': app.gradient } as CSSProperties;

  const activate = () => {
    if (target) window.location.assign(target);
  };

  const openDetails = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDetails(app);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  };

  const statusClass = mode === 'launchable'
    ? 'hub-module-card__status--ready'
    : mode === 'external'
      ? 'hub-module-card__status--external'
      : mode === 'unavailable'
        ? 'hub-module-card__status--coming-soon'
        : app.kind === 'ai'
          ? 'hub-module-card__status--ai'
          : 'hub-module-card__status--available';

  return (
    <article
      className={`hub-module-card group ${workspaceCard ? 'hub-module-card--workspace' : 'hub-module-card--catalog'}`}
      onClick={activatable ? activate : undefined}
      onKeyDown={activatable ? onKeyDown : undefined}
      tabIndex={activatable ? 0 : undefined}
      role={activatable ? 'link' : undefined}
      aria-label={activatable ? `${actionVerb} ${app.name}` : undefined}
    >
      <span className="hub-module-card__accent" style={{ background: app.gradient }} aria-hidden="true" />
      <span className="hub-module-card__wash" style={{ background: app.gradient }} aria-hidden="true" />

      <div className="hub-module-card__top">
        <span className="hub-module-card__icon" style={{ background: app.gradient }}>{app.icon}</span>
        <span className={`hub-module-card__status ${statusClass}`}>{app.statusLabel}</span>
      </div>

      <div className="hub-module-card__content">
        <span className="hub-module-card__category">{app.category}</span>
        <h3>{app.name}</h3>
        <p>{app.description}</p>
      </div>

      <div className={`hub-card-actions ${workspaceCard ? 'hub-card-actions--launchable' : 'hub-card-actions--catalog'}`}>
        {activatable ? (
          <a
            href={target}
            onClick={(event) => event.stopPropagation()}
            className="hub-card-action hub-card-action--primary"
            style={themedActionStyle}
          >
            <span>{actionVerb}</span><span aria-hidden="true">→</span>
          </a>
        ) : null}

        {mode === 'catalog' ? (
          <PlatformLink
            to={`/request-access?product=${encodeURIComponent(app.id)}`}
            onClick={(event) => event.stopPropagation()}
            className="hub-card-action hub-card-action--primary"
            style={themedActionStyle}
          >
            <span>Request app</span><span aria-hidden="true">→</span>
          </PlatformLink>
        ) : null}

        {mode === 'unavailable' ? <span className="hub-card-action hub-card-action--muted">Coming soon</span> : null}

        <button
          type="button"
          onClick={openDetails}
          className="hub-card-action hub-card-action--secondary-on-light"
        >
          <span aria-hidden="true">ⓘ</span><span>Details</span>
        </button>
      </div>
    </article>
  );
}
