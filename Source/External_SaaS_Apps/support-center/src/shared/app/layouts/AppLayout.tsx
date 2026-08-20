import type { PropsWithChildren } from 'react';
import { Footer } from '@shared/app/components/Footer';
import type { CatalogApp } from '@shared/app/types/app';
import { SolutionHead } from '@shared/platform/branding/SolutionHead';
import { PlatformTopbar } from '@shared/platform/shell/PlatformTopbar';

interface AppLayoutProps extends PropsWithChildren {
  app: CatalogApp;
  className?: string;
}

export function AppLayout({ app, children, className = '' }: AppLayoutProps) {
  return (
    <div className={`dashboard-page flex min-h-dvh flex-col ${className}`}>
      <SolutionHead app={app} />
      <PlatformTopbar currentApp={app} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
