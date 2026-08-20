import { availableSwitcherApps } from '../../app-registry/src/appCatalog';
import type { AppNavigationTarget } from '../../app-registry/src/types';

export interface AppSwitcherCatalogApp {
  id: string;
  name: string;
  shortName: string;
  category: string;
  icon: string;
  gradient: string;
  href: string;
  target: AppNavigationTarget;
}

export interface AppSwitcherCatalog {
  schemaVersion: 1;
  releaseVersion: string;
  appHubHref: string;
  apps: AppSwitcherCatalogApp[];
}

export interface AppSwitcherCatalogOptions {
  releaseVersion: string;
  appHubHref: string;
}

function safeProductionUrl(value?: string) {
  const candidate = value?.trim();
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

/**
 * Framework-neutral public launcher projection. The registry is the only source of app
 * destinations. The switcher host/CDN and the CFR App Hub may live on different domains.
 */
export function createProductionAppSwitcherCatalog(options: AppSwitcherCatalogOptions): AppSwitcherCatalog {
  const appHubHref = safeProductionUrl(options.appHubHref);
  if (!appHubHref) {
    throw new Error('APP_SWITCHER_APP_HUB_URL must be an absolute HTTPS URL for production publishing.');
  }

  const apps = availableSwitcherApps.flatMap((app) => {
    const href = safeProductionUrl(app.externalUrl);
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
    } satisfies AppSwitcherCatalogApp];
  });

  return {
    schemaVersion: 1,
    releaseVersion: options.releaseVersion,
    appHubHref,
    apps,
  };
}

export function serializeAppSwitcherCatalog(catalog: AppSwitcherCatalog) {
  const json = JSON.stringify(catalog).replaceAll('<', '\\u003c');
  return `window.__CatholicSolutionsAppSwitcherCatalogV1 = Object.freeze(${json});\n`;
}
