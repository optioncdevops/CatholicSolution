import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import type { CatalogApp } from '@shared/app/types/app';
import { resolveAppDestination } from '@shared/platform/navigation/solutionNavigation';

interface AppCardProps {
  app: CatalogApp;
  onDetails: (app: CatalogApp) => void;
  onRequest: (app: CatalogApp) => void;
  hidePrimaryAction?: boolean;
  /** 'request' routes the primary action into the existing Request Access flow instead of opening the app. */
  actionMode?: 'launch' | 'request';
  /** 'upcoming' presents the card as a roadmap product, derived from its catalog status. */
  statusMode?: 'catalog' | 'upcoming';
}

type CardMode = 'launchable' | 'external' | 'unavailable' | 'catalog';

function resolveMode(app: CatalogApp, hasDestination: boolean): CardMode {
  if (app.kind === 'launchable') return hasDestination ? 'launchable' : 'unavailable';
  if (app.kind === 'external') return hasDestination ? 'external' : 'unavailable';
  return 'catalog';
}


export function AppCard({ app, onDetails, onRequest, hidePrimaryAction = false, actionMode = 'launch', statusMode = 'catalog' }: AppCardProps) {
  const destination = resolveAppDestination(app);
  const mode = resolveMode(app, Boolean(destination));
  const requestMode = actionMode === 'request';
  const workspaceCard = mode !== 'catalog';
  const target = destination?.href;
  const deploymentPending = mode === 'launchable' && !target;
  const activatable = !requestMode && Boolean(target) && (mode === 'launchable' || mode === 'external');
  const actionVerb = mode === 'launchable' ? 'Launch' : 'Open';
  const themedActionStyle = { '--hub-action-theme': app.gradient } as CSSProperties;
  const openInNewTab = destination?.openInNewTab ?? false;
  const cardActivatable = activatable && !hidePrimaryAction;
  const showPrimaryAction = activatable && !hidePrimaryAction;
  const showRequestAction = requestMode && !hidePrimaryAction;
  const showCatalogAction = !requestMode && mode === 'catalog' && !hidePrimaryAction;
  const upcomingMode = statusMode === 'upcoming';
  const iconLinkLabel = requestMode ? `Open ${app.name} site` : `${actionVerb} ${app.name}${openInNewTab ? ' in a new tab' : ''}`;

  const activate = () => {
    if (!target) return;
    if (openInNewTab) window.open(target, '_blank', 'noopener,noreferrer');
    else window.location.assign(target);
  };
  const openDetails = (event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); onDetails(app); };
  const requestApp = (event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); onRequest(app); };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
  };

  const statusClass = deploymentPending
    ? 'hub-module-card__status--coming-soon'
    : mode === 'launchable'
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
      onClick={cardActivatable ? activate : undefined}
      onKeyDown={cardActivatable ? onKeyDown : undefined}
      tabIndex={cardActivatable ? 0 : undefined}
      role={cardActivatable ? 'link' : undefined}
      aria-label={cardActivatable ? `${actionVerb} ${app.name}${openInNewTab ? ' in a new tab' : ''}` : undefined}
    >
      <span className="hub-module-card__accent" style={{ background: app.gradient }} aria-hidden="true" />
      <span className="hub-module-card__wash" style={{ background: app.gradient }} aria-hidden="true" />
      <div className="hub-module-card__top">
        {(requestMode || hidePrimaryAction) && target ? (
          <a
            href={target}
            target={destination?.target}
            rel={destination?.rel}
            onClick={(event) => event.stopPropagation()}
            className="hub-module-card__icon hub-module-card__icon-link"
            style={{ background: app.gradient }}
            aria-label={iconLinkLabel}
            title={iconLinkLabel}
          >
            {app.icon}
          </a>
        ) : (
          <span className="hub-module-card__icon" style={{ background: app.gradient }}>{app.icon}</span>
        )}
        <h3 className="hub-module-card__name" title={app.name}>{app.name}</h3>
      </div>
      <div className="hub-module-card__meta">
        <span className="hub-module-card__category" title={app.category}>{app.category}</span>
        <span className={`hub-module-card__status ${requestMode ? 'hub-module-card__status--available' : upcomingMode ? 'hub-module-card__status--coming-soon' : statusClass}`}>{requestMode ? 'Access on request' : upcomingMode ? (app.status === 'coming-soon' ? 'Coming soon' : 'Upcoming') : deploymentPending ? 'Deployment pending' : app.statusLabel}</span>
      </div>
      <div className="hub-module-card__content">
        <p>{app.description}</p>
      </div>
      <div className={`hub-card-actions ${workspaceCard ? 'hub-card-actions--launchable' : 'hub-card-actions--catalog'}`}>
        {showPrimaryAction ? <a href={target} target={destination?.target} rel={destination?.rel} onClick={(event) => event.stopPropagation()} className="hub-card-action hub-card-action--primary" style={themedActionStyle}><span>{actionVerb}</span><span aria-hidden="true">{openInNewTab ? '↗' : '→'}</span></a> : null}
        {showCatalogAction ? <button type="button" onClick={requestApp} className="hub-card-action hub-card-action--primary" style={themedActionStyle}><span>Request app</span><span aria-hidden="true">→</span></button> : null}
        {showRequestAction ? <button type="button" onClick={requestApp} className="hub-card-action hub-card-action--request" aria-label={`Request access to ${app.name}`}><span aria-hidden="true">✚</span><span>Request access</span></button> : null}
        {mode === 'unavailable' ? <span className="hub-card-action hub-card-action--muted">Coming soon</span> : null}
        {deploymentPending ? <span className="hub-card-action hub-card-action--muted">Deployment pending</span> : null}
        <button type="button" onClick={openDetails} className="hub-card-action hub-card-action--secondary-on-light"><span aria-hidden="true">ⓘ</span><span>Details</span></button>
      </div>
    </article>
  );
}
