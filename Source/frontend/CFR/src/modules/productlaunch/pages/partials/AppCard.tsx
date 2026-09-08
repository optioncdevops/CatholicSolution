import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import type { CatalogApp } from '@shared/app/types/app';
import { resolveAppDestination } from '@shared/platform/navigation/solutionNavigation';

interface AppCardProps {
  app: CatalogApp;
  onDetails: (app: CatalogApp) => void;
  onRequest: (app: CatalogApp) => void;
  onLaunch?: (app: CatalogApp) => void;
  hidePrimaryAction?: boolean;
  /** 'request' routes the primary action into the existing Request Access flow instead of opening the app. */
  actionMode?: 'launch' | 'request';
  /** 'upcoming' presents the card as a roadmap product, derived from its catalog status. */
  statusMode?: 'catalog' | 'upcoming';
  alreadyRequested?: boolean;
}

type CardMode = 'launchable' | 'external' | 'unavailable' | 'catalog';

function resolveMode(app: CatalogApp, hasDestination: boolean): CardMode {
  if (app.kind === 'launchable') return hasDestination ? 'launchable' : 'unavailable';
  if (app.kind === 'external') return hasDestination ? 'external' : 'unavailable';
  return 'catalog';
}


export function AppCard({ app, onDetails, onRequest, onLaunch, hidePrimaryAction = false, actionMode = 'launch', statusMode = 'catalog', alreadyRequested = false }: AppCardProps) {
  const destination = resolveAppDestination(app);
  const ssoLaunch = Boolean(onLaunch && app.productId && app.hubSection === 'your' && actionMode === 'launch');
  const requestMode = actionMode === 'request';
  const mode = resolveMode(app, Boolean(destination) || ssoLaunch || requestMode);
  const workspaceCard = mode !== 'catalog';
  const target = destination?.href;
  const deploymentPending = !requestMode && mode === 'launchable' && !target && !ssoLaunch;
  const activatable = !requestMode && (ssoLaunch || Boolean(target)) && (mode === 'launchable' || mode === 'external');
  const actionVerb = mode === 'launchable' ? 'Launch' : 'Open';
  const themedActionStyle = { '--hub-action-theme': app.gradient } as CSSProperties;
  const openInNewTab = destination?.openInNewTab ?? false;
  const cardActivatable = activatable && !hidePrimaryAction;
  const showPrimaryAction = activatable && !hidePrimaryAction;
  const showRequestAction = requestMode && !hidePrimaryAction && Boolean(app.canRequest);
  const showCatalogAction = !requestMode && mode === 'catalog' && !hidePrimaryAction && Boolean(app.canRequest);
  const upcomingMode = statusMode === 'upcoming';

  const activate = () => {
    if (ssoLaunch && onLaunch) {
      void onLaunch(app);
      return;
    }
    if (!target) return;
    if (openInNewTab) window.open(target, '_blank', 'noopener,noreferrer');
    else window.location.assign(target);
  };
  const isOrgApproved = Boolean(app.isOrgApproved);
  const isDisabled = alreadyRequested || isOrgApproved;
  const openDetails = (event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); onDetails(app); };

  const requestApp = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isOrgApproved) return;
    if (alreadyRequested) return;
    onRequest(app);
  };
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
        <span className="hub-module-card__icon" style={{ background: app.gradient }}>{app.icon}</span>
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
        {showPrimaryAction ? (
          ssoLaunch ? (
            <button type="button" onClick={(event) => { event.stopPropagation(); activate(); }} className="hub-card-action hub-card-action--primary" style={themedActionStyle}>
              <span>{actionVerb}</span>
              <span aria-hidden="true">{openInNewTab ? '↗' : '→'}</span>
            </button>
          ) : (
            <a href={target} target={destination?.target} rel={destination?.rel} onClick={(event) => event.stopPropagation()} className="hub-card-action hub-card-action--primary" style={themedActionStyle}>
              <span>{actionVerb}</span>
              <span aria-hidden="true">{openInNewTab ? '↗' : '→'}</span>
            </a>
          )
        ) : null}
        {showCatalogAction ? (
          <button
            type="button"
            onClick={requestApp}
            disabled={isDisabled}
            className="hub-card-action hub-card-action--primary"
            style={themedActionStyle}
          >
            <span>{isOrgApproved ? 'Approved' : alreadyRequested ? 'Requested' : 'Request app'}</span>
            <span aria-hidden="true">→</span>
          </button>
        ) : null}
        {showRequestAction ? (
          <button
            type="button"
            onClick={requestApp}
            disabled={isDisabled}
            className="hub-card-action hub-card-action--request"
            aria-label={isOrgApproved ? `Access already approved for your organization for ${app.name}` : alreadyRequested ? `Access already requested for ${app.name}` : `Request access to ${app.name}`}
          >
            <span aria-hidden="true">{isOrgApproved || alreadyRequested ? '✓' : '✚'}</span>
            <span>{isOrgApproved ? 'Approved' : alreadyRequested ? 'Requested' : 'Request access'}</span>
          </button>
        ) : null}
        {mode === 'unavailable' ? <span className="hub-card-action hub-card-action--muted">Coming soon</span> : null}
        {deploymentPending ? <span className="hub-card-action hub-card-action--muted">Deployment pending</span> : null}
        <button type="button" onClick={openDetails} className="hub-card-action hub-card-action--secondary-on-light"><span aria-hidden="true">ⓘ</span><span>Details</span></button>
      </div>
    </article>
  );
}
