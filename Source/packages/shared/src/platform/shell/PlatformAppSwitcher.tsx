import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_CATALOG } from '@shared/app/config/appCatalog';
import type { CatalogApp } from '@shared/app/types/app';
import { AppsIcon, ChevronDownIcon, ChevronRightIcon } from '@shared/app/components/UiIcons';
import { resolveAppDestination, resolvePlatformUrl, type AppDestination } from '@shared/platform/navigation/solutionNavigation';

interface PlatformAppSwitcherProps {
  currentApp: CatalogApp;
}

export function PlatformAppSwitcher({ currentApp }: PlatformAppSwitcherProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const headingId = useId();

  // Close the launcher when in-app navigation changes the route. Adjusted during render
  // rather than in an effect so the menu never paints open over the newly routed view.
  const [renderedPath, setRenderedPath] = useState(location.pathname);
  if (location.pathname !== renderedPath) {
    setRenderedPath(location.pathname);
    setOpen(false);
  }

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeEscape);
    };
  }, []);

  const renderApp = (app: CatalogApp, destination: AppDestination) => {
    const current = app.id === currentApp.id;
    const content = (
      <>
        <span className="app-switcher__app-icon" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
        <span className="app-switcher__item-copy">
          <span className="app-switcher__item-title">{app.shortName || app.name}</span>
          <span className="app-switcher__item-category">{app.category}</span>
        </span>
      </>
    );

    if (current) {
      return (
        <div className="app-switcher__tile app-switcher__tile--current" aria-current="page">
          {content}
        </div>
      );
    }

    return (
      <a
        href={destination.href}
        target={destination.target}
        rel={destination.rel}
        onClick={() => setOpen(false)}
        className="app-switcher__tile"
        aria-label={`Open ${app.name}${destination.openInNewTab ? ' in a new tab' : ''}`}
      >
        {content}
      </a>
    );
  };

  const switcherApps = APP_CATALOG.flatMap((app) => {
    const destination = resolveAppDestination(app);
    return destination ? [{ app, destination }] : [];
  });
  const gridClass = switcherApps.length > 6
    ? 'app-switcher__grid app-switcher__grid--three'
    : 'app-switcher__grid app-switcher__grid--two';

  return (
    <div className="app-switcher" ref={wrapperRef}>
      <button
        type="button"
        className={`app-switcher__trigger ${open ? 'app-switcher__trigger--open' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
      >
        <span className="app-switcher__trigger-icon" aria-hidden="true"><AppsIcon size={16} /></span>
        <span className="app-switcher__trigger-label">
          <span className="app-switcher__trigger-title">Switch app</span>
          <span className="app-switcher__trigger-sub">{currentApp.shortName || currentApp.name}</span>
        </span>
        <ChevronDownIcon size={14} className={`app-switcher__chevron ${open ? 'app-switcher__chevron--open' : ''}`} />
      </button>

      {open ? (
        <div id={menuId} className="app-switcher__menu" role="menu" aria-labelledby={headingId}>
          <div className="app-switcher__header">
            <div>
              <h2 id={headingId}>Jump to another app</h2>
              <p>Open Catholic Solutions and approved connected apps</p>
            </div>
            <span className="app-switcher__count">{switcherApps.length}</span>
          </div>

          <ul className={gridClass}>
            {switcherApps.map(({ app, destination }) => <li key={app.id}>{renderApp(app, destination)}</li>)}
          </ul>

          <div className="app-switcher__footer">
            <a
              href={resolvePlatformUrl('/apps')}
              onClick={() => setOpen(false)}
              className="app-switcher__all-apps"
              aria-label="Open all apps in the App Hub"
            >
              <AppsIcon size={15} />
              <span>All apps in App Hub</span>
              <ChevronRightIcon size={14} />
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
