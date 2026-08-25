import { useEffect, useState } from 'react';
import type { CatalogApp } from '@shared/app/types/app';

type SwitcherStatus = 'loading' | 'ready' | 'unavailable';

const TAG_NAME = 'catholic-solutions-app-switcher';
const REGISTRATION_TIMEOUT_MS = 8000;

function resolveManifestUrl(scriptUrl: string) {
  if (!scriptUrl) return '';
  const suffix = import.meta.env.MODE === 'development' ? 'manifest.dev.json' : 'manifest.json';
  return scriptUrl.replace(/[^/]*$/, suffix);
}

interface PlatformAppSwitcherProps {
  currentApp: CatalogApp;
}

/**
 * Loads the centrally hosted, versioned App Switcher custom element. The element itself
 * fetches the approved-destination manifest and handles its own loading/failed states in
 * its shadow DOM; this wrapper only tracks whether the hosted script registered the
 * custom element at all, so a slow or failed script load never blocks this app's UI.
 */
export function PlatformAppSwitcher({ currentApp }: PlatformAppSwitcherProps) {
  const appHubUrl = import.meta.env.VITE_APP_HUB_URL;
  const switcherScriptUrl = import.meta.env.VITE_APP_SWITCHER_URL;
  const [status, setStatus] = useState<SwitcherStatus>(() => {
    if (typeof window === 'undefined' || !window.customElements) return 'unavailable';
    return window.customElements.get(TAG_NAME) ? 'ready' : 'loading';
  });

  useEffect(() => {
    if (status !== 'loading' || typeof window === 'undefined' || !window.customElements) return;

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setStatus('unavailable');
    }, REGISTRATION_TIMEOUT_MS);

    window.customElements.whenDefined(TAG_NAME)
      .then(() => {
        if (cancelled) return;
        window.clearTimeout(timeout);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable');
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [status]);

  if (status === 'unavailable') return null;

  if (status === 'loading') {
    return <span className="app-switcher-skeleton" role="status" aria-label="Loading app switcher" />;
  }

  return (
    <catholic-solutions-app-switcher
      current-app-id={currentApp.id}
      current-app-name={currentApp.shortName || currentApp.name}
      current-app-icon={currentApp.icon}
      current-app-category={currentApp.category}
      accent-gradient={currentApp.gradient}
      manifest-url={resolveManifestUrl(switcherScriptUrl)}
      app-hub-url={appHubUrl}
    />
  );
}
