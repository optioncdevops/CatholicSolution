import { APP_CATALOG } from '../../../app/config/appCatalog';
import { getAppAuthConfig } from '../../../auth/appAuthConfig';
import type { AppNavigationTarget, CatalogApp } from '../../../app/types/app';

export interface ExternalSwitcherApp {
  id: string;
  name: string;
  shortName: string;
  category: string;
  icon: string;
  gradient: string;
  href: string;
  target: AppNavigationTarget;
}

export interface ExternalAppSwitcherManifest {
  version: string;
  appHubHref: string;
  apps: ExternalSwitcherApp[];
}

function normalizeOrigin(origin: string) {
  return origin.replace(/\/$/, '');
}

function safeHttpUrl(value?: string) {
  const candidate = value?.trim();
  if (!candidate) return '';

  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:' ? candidate : '';
  } catch {
    return '';
  }
}

function internalOrigin(app: CatalogApp) {
  const origins = getAppAuthConfig('production').origins;
  const byAppId: Record<string, string> = {
    'optionc-school': origins.optioncSchool,
    'matt-money': origins.mattMoney,
    'arc-alerts': origins.arcAlerts,
    'optionc-parish': origins.optioncParish,
    'catholic-content': origins.catholicContent,
    'unified-directory': origins.unifiedDirectory,
    'support-center': origins.supportCenter,
    'ai-lesson-plan': origins.aiLessonPlan,
  };
  return byAppId[app.id] ?? '';
}

function productionHref(app: CatalogApp) {
  if (app.externalUrl !== undefined || app.kind === 'external') return safeHttpUrl(app.externalUrl);

  const origin = internalOrigin(app);
  if (!origin) return '';
  const route = app.route?.startsWith('/') ? app.route : `/${app.route ?? ''}`;
  return `${normalizeOrigin(origin)}${route || '/'}`;
}

/**
 * Build-time contract used to publish the framework-neutral switcher asset from App Hub.
 * It intentionally derives from APP_CATALOG so partner applications never maintain a
 * second application list or destination map.
 */
export function createProductionAppSwitcherManifest(version: string): ExternalAppSwitcherManifest {
  const platformOrigin = getAppAuthConfig('production').origins.platform;
  const apps = APP_CATALOG.flatMap((app) => {
    const href = productionHref(app);
    if (!href) return [];

    return [{
      id: app.id,
      name: app.name,
      shortName: app.shortName,
      category: app.category,
      icon: app.icon,
      gradient: app.gradient,
      href,
      target: app.navigationTarget ?? 'same-tab',
    } satisfies ExternalSwitcherApp];
  });

  return {
    version,
    appHubHref: `${normalizeOrigin(platformOrigin)}/apps`,
    apps,
  };
}
