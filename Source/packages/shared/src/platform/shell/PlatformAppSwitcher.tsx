import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { launchableApps } from '@shared/app/config/appCatalog';
import type { CatalogApp } from '@shared/app/types/app';
import { AppsIcon, ArrowUpRightIcon, CheckIcon, ChevronDownIcon } from '@shared/app/components/UiIcons';
import { resolveAppUrl, resolvePlatformUrl } from '@shared/platform/navigation/solutionNavigation';

interface PlatformAppSwitcherProps {
  currentApp: CatalogApp;
}

const SUPPORT_CENTER_ID = 'support-center';
const PRIMARY_APP_ORDER = [
  'optionc-school',
  'optionc-parish',
  'arc-alerts',
  'matt-money',
  'catholic-content',
  'unified-directory',
] as const;

const primaryAppIds = new Set<string>(PRIMARY_APP_ORDER);
const primaryApps = [
  ...PRIMARY_APP_ORDER.flatMap((id) => {
    const app = launchableApps.find((candidate) => candidate.id === id);
    return app ? [app] : [];
  }),
  ...launchableApps.filter((app) => app.id !== SUPPORT_CENTER_ID && !primaryAppIds.has(app.id)),
];
const supportCenter = launchableApps.find((app) => app.id === SUPPORT_CENTER_ID);

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

  const renderPrimaryApp = (app: CatalogApp) => {
    const current = app.id === currentApp.id;
    const content = (
      <>
        <span className="app-switcher__app-icon" style={{ background: app.gradient }}>{app.icon}</span>
        <span className="app-switcher__item-title">{app.name}</span>
        {current ? (
          <span className="app-switcher__current-mark" title="Current app"><CheckIcon size={11} /></span>
        ) : null}
        {current ? <span className="sr-only">— current app</span> : null}
      </>
    );

    return current ? (
      <div className="app-switcher__tile app-switcher__tile--current" aria-current="true">{content}</div>
    ) : (
      <a
        href={resolveAppUrl(app)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setOpen(false)}
        className="app-switcher__tile"
        aria-label={`Open ${app.name} in a new tab`}
      >
        {content}
      </a>
    );
  };

  const renderSupportCenter = (app: CatalogApp) => {
    const current = app.id === currentApp.id;
    const content = (
      <>
        <span className="app-switcher__support-icon" style={{ background: app.gradient }}>{app.icon}</span>
        <span className="app-switcher__support-copy">
          <strong>{app.name}</strong>
          <small>Help, tickets &amp; resources</small>
        </span>
        {current ? (
          <span className="app-switcher__current-mark" title="Current app"><CheckIcon size={11} /></span>
        ) : (
          <ArrowUpRightIcon size={14} className="app-switcher__support-arrow" />
        )}
        {current ? <span className="sr-only">— current app</span> : null}
      </>
    );

    return current ? (
      <div className="app-switcher__support app-switcher__support--current" aria-current="true">{content}</div>
    ) : (
      <a
        href={resolveAppUrl(app)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setOpen(false)}
        className="app-switcher__support"
        aria-label={`Open ${app.name} in a new tab`}
      >
        {content}
      </a>
    );
  };

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

          <ul className="app-switcher__grid">
            {primaryApps.map((app) => <li key={app.id}>{renderPrimaryApp(app)}</li>)}
          </ul>

          {supportCenter ? <div className="app-switcher__support-wrap">{renderSupportCenter(supportCenter)}</div> : null}

          <div className="app-switcher__footer">
            <a
              href={resolvePlatformUrl('/apps')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="app-switcher__all-apps"
              aria-label="Open all apps in the App Hub in a new tab"
            >
              <AppsIcon size={15} />
              <span>All apps</span>
              <ArrowUpRightIcon size={14} />
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
