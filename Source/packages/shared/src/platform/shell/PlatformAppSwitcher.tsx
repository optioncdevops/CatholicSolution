import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { availableSwitcherApps } from '@shared/app/config/appCatalog';
import type { CatalogApp } from '@shared/app/types/app';
import { AppsIcon, ChevronDownIcon, ChevronRightIcon } from '@shared/app/components/UiIcons';
import { resolveAppUrl, resolvePlatformUrl } from '@shared/platform/navigation/solutionNavigation';

interface PlatformAppSwitcherProps {
  currentApp: CatalogApp;
}

function switcherTarget(app: CatalogApp) {
  return app.kind === 'external' ? app.externalUrl : resolveAppUrl(app);
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

  const renderApp = (app: CatalogApp) => {
    const current = app.id === currentApp.id;
    const target = switcherTarget(app);
    const content = (
      <>
        <span className="app-switcher__app-icon" style={{ background: app.gradient }}>{app.icon}</span>
        <span className="app-switcher__item-title">{app.name}</span>
        {current ? <span className="sr-only">— current app</span> : null}
      </>
    );

    if (current) {
      return (
        <div className="app-switcher__tile app-switcher__tile--current" aria-current="page">
          {content}
        </div>
      );
    }

    if (!target) {
      return (
        <div className="app-switcher__tile app-switcher__tile--disabled" aria-disabled="true">
          {content}
        </div>
      );
    }

    return (
      <a
        href={target}
        onClick={() => setOpen(false)}
        className="app-switcher__tile"
        aria-label={`Open ${app.name}`}
      >
        {content}
      </a>
    );
  };

  const switcherApps = availableSwitcherApps.filter((app) => Boolean(switcherTarget(app)));
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
        aria-controls={menuId}
      >
        <span className="app-switcher__trigger-icon"><AppsIcon size={18} /></span>
        <span className="hidden sm:inline">Switch app</span>
        <ChevronDownIcon size={14} className={`app-switcher__chevron ${open ? 'app-switcher__chevron--open' : ''}`} />
      </button>

      {open ? (
        <div id={menuId} className="app-switcher__menu" aria-labelledby={headingId}>
          <div className="app-switcher__header">
            <h2 id={headingId}>Jump to</h2>
          </div>

          <ul className={gridClass}>
            {switcherApps.map((app) => <li key={app.id}>{renderApp(app)}</li>)}
          </ul>

          <div className="app-switcher__footer">
            <a
              href={resolvePlatformUrl('/apps')}
              onClick={() => setOpen(false)}
              className="app-switcher__all-apps"
              aria-label="Open all apps in the App Hub"
            >
              <AppsIcon size={15} />
              <span>All apps</span>
              <ChevronRightIcon size={14} />
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
