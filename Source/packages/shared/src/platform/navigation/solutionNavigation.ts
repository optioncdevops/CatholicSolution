import { useNavigate } from 'react-router-dom';
import type { CatalogApp } from '@shared/app/types/app';
import { environment, isConfiguredOrigin } from '@shared/platform/config/environment';
import { SOLUTION_REGISTRY, solutionForApp, type SolutionConfig, type SolutionId } from '@shared/platform/config/solutionRegistry';

function normalizedOrigin(origin: string) {
  return origin.replace(/\/$/, '');
}

export function resolveSolutionUrl(solution: SolutionConfig, route = solution.route) {
  if (!environment.domainRouting || !isConfiguredOrigin(solution.origin)) return route;
  const path = route.startsWith('/') ? route : `/${route}`;
  return `${normalizedOrigin(solution.origin)}${path === '/' ? '/' : path}`;
}

export function resolveAppUrl(app: CatalogApp) {
  const solution = solutionForApp(app);
  return solution ? resolveSolutionUrl(solution) : app.route ?? resolvePlatformUrl('/apps');
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
    goToApp(app: CatalogApp) { goToUrl(resolveAppUrl(app)); },
    goToSolution(id: SolutionId, path?: string) { goToUrl(resolveSolutionUrl(SOLUTION_REGISTRY[id], path ?? SOLUTION_REGISTRY[id].route)); },
    goToPlatform(path = '/apps') { goToUrl(resolvePlatformUrl(path)); },
  };
}
