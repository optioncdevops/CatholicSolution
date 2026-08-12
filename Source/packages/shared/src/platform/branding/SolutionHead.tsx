import { useEffect } from 'react';
import type { CatalogApp } from '@shared/app/types/app';
import { SOLUTION_REGISTRY, solutionForApp, type SolutionId } from '@shared/platform/config/solutionRegistry';

interface SolutionHeadProps {
  app?: CatalogApp;
  solutionId?: SolutionId;
  pageTitle?: string;
}

function ensureLink(rel: string) {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  return link;
}

export function SolutionHead({ app, solutionId = 'platform', pageTitle }: SolutionHeadProps) {
  useEffect(() => {
    const solution = app ? solutionForApp(app) : SOLUTION_REGISTRY[solutionId];
    if (!solution) return;

    const previousTitle = document.title;
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousTheme = themeMeta?.content;
    const favicon = ensureLink('icon');
    const previousIcon = favicon.href;

    document.title = pageTitle ? `${pageTitle} | ${solution.title}` : solution.title;
    favicon.type = 'image/svg+xml';
    const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
    favicon.href = `${base}${solution.favicon}`;
    if (themeMeta) themeMeta.content = solution.themeColor;

    return () => {
      document.title = previousTitle;
      favicon.href = previousIcon;
      if (themeMeta && previousTheme) themeMeta.content = previousTheme;
    };
  }, [app, pageTitle, solutionId]);

  return null;
}
