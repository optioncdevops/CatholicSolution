import type { CatalogApp } from '@shared/app/types/app';
import { ProfileMenu } from '@shared/app/components/ProfileMenu';
import { PlatformAppSwitcher } from './PlatformAppSwitcher';

interface PlatformTopbarProps {
  currentApp: CatalogApp;
}

export function PlatformTopbar({ currentApp }: PlatformTopbarProps) {
  return (
    <header className="app-topbar" data-platform-shell="true">
      <div className="app-topbar__identity">
        <span className="app-topbar__icon" style={{ background: currentApp.gradient }}>{currentApp.icon}</span>
        <span className="app-topbar__copy">
          <span className="app-topbar__name">{currentApp.name}</span>
          <span className="app-topbar__category">{currentApp.category}</span>
        </span>
      </div>
      <div className="app-topbar__spacer" />
      <PlatformAppSwitcher currentApp={currentApp} />
      <ProfileMenu gradient={currentApp.gradient} />
    </header>
  );
}
