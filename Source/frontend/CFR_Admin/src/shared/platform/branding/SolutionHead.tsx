import { useEffect } from 'react';
import { SOLUTION_REGISTRY, type SolutionId } from '@shared/platform/config/solutionRegistry';

interface SolutionHeadProps {
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

export function SolutionHead({ solutionId = 'platform', pageTitle }: SolutionHeadProps) {
  useEffect(() => {
    const solution = SOLUTION_REGISTRY[solutionId];
    const previousTitle = document.title;
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousTheme = themeMeta?.content;
    const favicon = ensureLink('icon');
    const previousIcon = favicon.href;

    document.title = pageTitle ? `${pageTitle} | ${solution.title}` : solution.title;
    favicon.type = 'image/png';
    // solution.favicon is a bundler-imported asset URL (see solutionRegistry.ts), already
    // correctly resolved against the app's base path — no manual BASE_URL prefixing needed.
    favicon.href = solution.favicon;
    if (themeMeta) themeMeta.content = solution.themeColor;

    return () => {
      document.title = previousTitle;
      favicon.href = previousIcon;
      if (themeMeta && previousTheme) themeMeta.content = previousTheme;
    };
  }, [pageTitle, solutionId]);

  return null;
}
