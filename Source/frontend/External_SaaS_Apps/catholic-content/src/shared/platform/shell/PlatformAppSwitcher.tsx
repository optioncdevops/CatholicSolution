import type { CatalogApp } from '@shared/app/types/app';

interface PlatformAppSwitcherProps {
  currentApp: CatalogApp;
}

export function PlatformAppSwitcher({ currentApp }: PlatformAppSwitcherProps) {
  const appHubUrl = import.meta.env.VITE_APP_HUB_URL || 'https://cfr.optioncapp.com/apps';

  return (
    <catholic-solutions-app-switcher
      current-app-id={currentApp.id}
      current-app-name={currentApp.shortName || currentApp.name}
      app-hub-url={appHubUrl}
    />
  );
}
