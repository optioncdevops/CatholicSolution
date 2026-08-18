import { useNavigate } from 'react-router-dom';
import type { CatalogApp } from '@shared/app/types/app';
import { environment, isConfiguredOrigin } from '@shared/platform/config/environment';
import { SOLUTION_REGISTRY, solutionForApp, type SolutionConfig, type SolutionId } from '@shared/platform/config/solutionRegistry';

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

function resolveSafeExternalUrl(value?: string) {
  const candidate = value?.trim();
  if (!candidate) return '';

  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:' ? candidate : '';
  } catch {
    return '';
  }
}

export function resolveSolutionUrl(solution: SolutionConfig, route = solution.route) {
  if (!environment.domainRouting) return route;
  if (!isConfiguredOrigin(solution.origin)) return '';
  const path = route.startsWith('/') ? route : `/${route}`;
  return `${normalizedOrigin(solution.origin)}${path === '/' ? '/' : path}`;
}

export function resolveAppUrl(app: CatalogApp) {
  const solution = solutionForApp(app);
  return solution ? resolveSolutionUrl(solution) : app.route ?? resolvePlatformUrl('/apps');
}

/**
 * Canonical launch resolver for App Hub and the shared application launcher.
 * Registered Catholic Solutions workspaces resolve through SOLUTION_REGISTRY;
 * catalog-only products may point at an approved absolute web URL without being
 * added to the monorepo or central-session boundary.
 */
export function resolveAppDestination(app: CatalogApp): AppDestination | null {
  // Catalog launch metadata is authoritative. This also supports a dormant internal
  // prototype remaining registered while the published product temporarily points
  // to an approved external service.
  const externalHref = app.externalUrl === undefined ? '' : resolveSafeExternalUrl(app.externalUrl);
  if (app.kind === 'external' || app.externalUrl !== undefined) {
    if (!externalHref) return null;
    const openInNewTab = app.navigationTarget === 'new-tab';
    return {
      href: externalHref,
      isExternal: true,
      openInNewTab,
      target: openInNewTab ? '_blank' : undefined,
      rel: openInNewTab ? 'noopener noreferrer' : undefined,
    };
  }

  const solution = solutionForApp(app);
  const href = solution ? resolveAppUrl(app) : '';
  if (!href) return null;

  const openInNewTab = app.navigationTarget === 'new-tab';
  return {
    href,
    isExternal: false,
    openInNewTab,
    target: openInNewTab ? '_blank' : undefined,
    rel: openInNewTab ? 'noopener noreferrer' : undefined,
  };
}

export function resolvePlatformUrl(path = '/apps') {
  return resolveSolutionUrl(SOLUTION_REGISTRY.platform, path);
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
    goToSolution(id: SolutionId, path?: string) { goToUrl(resolveSolutionUrl(SOLUTION_REGISTRY[id], path ?? SOLUTION_REGISTRY[id].route)); },
    goToPlatform(path = '/apps') { goToUrl(resolvePlatformUrl(path)); },
  };
}
