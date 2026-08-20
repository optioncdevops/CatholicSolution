import type { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  count?: string;
  action?: ReactNode;
  dark?: boolean;
}

export function SectionHeading({ title, count, action, dark = false }: SectionHeadingProps) {
  return (
    <div className={`hub-section-heading ${dark ? 'hub-section-heading--dark' : ''}`}>
      <div className="hub-section-heading__title-wrap">
        <span className="hub-section-heading__mark" aria-hidden="true">✝</span>
        <h2>{title}</h2>
      </div>
      {action ?? (count ? <span className="hub-section-heading__count">{count}</span> : null)}
    </div>
  );
}
