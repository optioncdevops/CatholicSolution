import { useNavigate } from 'react-router-dom';
import type { CatalogApp } from '@shared/app/types/app';
import { environment, isConfiguredOrigin } from '@shared/platform/config/environment';

export interface AppDestination {
  href: string;
  isExternal: boolean;
  openInNewTab: boolean;
  target?: '_blank';
  rel?: 'noopener noreferrer';
}

function normalizedOrigin(origin: string) {
  return origin.replace(/\/$/, '');
}

function resolveSafeHttpUrl(value?: string) {
  const candidate = value?.trim();
  if (!candidate) return '';

  try {
    const url = new URL(candidate);
    const localDevelopment = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
    return url.protocol === 'https:' || localDevelopment ? candidate : '';
  } catch {
    return '';
  }
}

/**
 * Canonical App Hub launch resolver. Every product outside CFR is independently deployed
 * and is reached only through its centrally approved catalog destination.
 */
export function resolveAppDestination(app: CatalogApp): AppDestination | null {
  const href = resolveSafeHttpUrl(app.externalUrl);
  if (!href) return null;

  const openInNewTab = app.navigationTarget === 'new-tab';
  return {
    href,
    isExternal: true,
    openInNewTab,
    target: openInNewTab ? '_blank' : undefined,
    rel: openInNewTab ? 'noopener noreferrer' : undefined,
  };
}

export function resolvePlatformUrl(path = '/apps') {
  const route = path.startsWith('/') ? path : `/${path}`;
  if (!environment.domainRouting) return route;
  if (!isConfiguredOrigin(environment.origins.platform)) return route;
  return `${normalizedOrigin(environment.origins.platform)}${route}`;
}

export function useSolutionNavigation() {
  const navigate = useNavigate();

  const goToUrl = (target: string) => {
    if (!/^https?:\/\//i.test(target)) {
      navigate(target);
      return;
    }
    const url = new URL(target);
    if (typeof window !== 'undefined' && url.origin === window.location.origin) {
      navigate(`${url.pathname}${url.search}${url.hash}`);
      return;
    }
    window.location.assign(target);
  };

  return {
    goToApp(app: CatalogApp) {
      const destination = resolveAppDestination(app);
      if (destination) goToUrl(destination.href);
    },
    goToPlatform(path = '/apps') {
      goToUrl(resolvePlatformUrl(path));
    },
  };
}
