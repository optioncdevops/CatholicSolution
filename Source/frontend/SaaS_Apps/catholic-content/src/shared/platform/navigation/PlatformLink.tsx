import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { resolvePlatformUrl } from './solutionNavigation';

interface PlatformLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children: ReactNode;
}

export function PlatformLink({ to, children, ...props }: PlatformLinkProps) {
  const target = resolvePlatformUrl(to);
  if (/^https?:\/\//i.test(target)) {
    if (typeof window !== 'undefined') {
      const url = new URL(target);
      if (url.origin === window.location.origin) return <Link to={`${url.pathname}${url.search}${url.hash}`} {...props}>{children}</Link>;
    }
    return <a href={target} {...props}>{children}</a>;
  }
  return <Link to={target} {...props}>{children}</Link>;
}
