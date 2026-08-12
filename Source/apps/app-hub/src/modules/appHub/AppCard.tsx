import type { KeyboardEvent, MouseEvent } from 'react';
import type { CatalogApp } from '@shared/app/types/app';
import { resolveAppUrl } from '@shared/platform/navigation/solutionNavigation';

interface AppCardProps {
  app: CatalogApp;
  onDetails: (app: CatalogApp) => void;
}

/**
 * How a catalog entry presents on the App Hub grid.
 *
 * - `launchable` — a Catholic Solutions solution behind the central login.
 * - `external`   — a partner product on its own domain.
 * - `unavailable`— an external product that is not published yet; non-interactive.
 * - `catalog`    — an AI/Discover entry; white surface with a Learn More affordance.
 */
type CardMode = 'launchable' | 'external' | 'unavailable' | 'catalog';

function resolveMode(app: CatalogApp): CardMode {
  if (app.route) return 'launchable';
  if (app.kind !== 'external') return 'catalog';
  return app.externalUrl ? 'external' : 'unavailable';
}

export function AppCard({ app, onDetails }: AppCardProps) {
  const mode = resolveMode(app);
  const onColor = mode !== 'catalog';
  const activatable = mode === 'launchable' || mode === 'external';

  /*
   * Launching opens the destination in its own tab so the App Hub stays available as a
   * launcher rather than being replaced by the app the user just opened.
   *
   * `noopener` is applied in both cases so the opened page cannot reach back through
   * `window.opener`. Third-party partner sites additionally get `noreferrer`, which
   * first-party solutions do not need — they are our own origins.
   */
  const target = mode === 'launchable' ? resolveAppUrl(app) : app.externalUrl;
  const linkRelationship = mode === 'launchable' ? 'noopener' : 'noopener noreferrer';
  const windowFeatures = mode === 'launchable' ? 'noopener' : 'noopener,noreferrer';
  const actionVerb = mode === 'launchable' ? 'Launch' : 'Open';

  const activate = () => {
    if (target) window.open(target, '_blank', windowFeatures);
  };

  const openDetails = (event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); onDetails(app); };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
  };

  return (
    <article
      className={`hub-module-card group ${onColor ? 'hub-module-card--launchable' : 'hub-module-card--catalog'}`}
      style={onColor ? { background: app.gradient } : undefined}
      onClick={activatable ? activate : undefined}
      onKeyDown={activatable ? onKeyDown : undefined}
      tabIndex={activatable ? 0 : undefined}
      role={activatable ? 'link' : undefined}
      aria-label={activatable ? `${actionVerb} ${app.name} in a new tab` : undefined}
    >
      {onColor ? (
        <span className="hub-module-card__glow" aria-hidden="true" />
      ) : (
        <span className="hub-module-card__accent" style={{ background: app.gradient }} aria-hidden="true" />
      )}

      <div className="hub-module-card__top">
        <span
          className={`hub-module-card__icon ${onColor ? 'hub-module-card__icon--on-color' : ''}`}
          style={!onColor ? { background: app.gradient } : undefined}
        >
          {app.icon}
        </span>
        <span className={`hub-module-card__status ${mode === 'unavailable' ? 'hub-module-card__status--coming-soon' : onColor ? 'hub-module-card__status--on-color' : app.kind === 'ai' ? 'hub-module-card__status--ai' : 'hub-module-card__status--available'}`}>
          {app.statusLabel}
        </span>
      </div>

      <div className="hub-module-card__content">
        <h3>{app.name}</h3>
        <p>{app.description}</p>
      </div>

      <div className={`hub-card-actions ${onColor ? 'hub-card-actions--launchable' : 'hub-card-actions--catalog'}`}>
        {activatable ? (
          // A real anchor rather than a button: it exposes the destination to assistive
          // technology and preserves the browser's own ctrl/middle-click and
          // open-in-new-window affordances, which window.open alone would discard.
          <a
            href={target}
            target="_blank"
            rel={linkRelationship}
            onClick={(event) => event.stopPropagation()}
            className="hub-card-action hub-card-action--primary"
          >
            <span>{actionVerb}</span><span aria-hidden="true">↗</span>
          </a>
        ) : null}

        {mode === 'unavailable' ? (
          <span className="hub-card-action hub-card-action--muted">Coming soon</span>
        ) : null}

        <button
          type="button"
          onClick={openDetails}
          className={`hub-card-action ${onColor ? 'hub-card-action--secondary-on-color' : 'hub-card-action--secondary-on-light'}`}
        >
          {onColor ? <><span aria-hidden="true">ⓘ</span><span>Details</span></> : <><span>Learn More</span><span aria-hidden="true">→</span></>}
        </button>
      </div>
    </article>
  );
}
