import type { ReactNode } from 'react';

interface PanelHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Optional icon badge shown to the left of the title. */
  icon?: ReactNode;
}

export function PanelHeader({ title, description, action }: PanelHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-soft)] pb-2.5">
      <div className="flex items-center gap-0.5">
    
        <div>
          <h1 className="font-display text-lg font-extrabold tracking-tight text-[var(--text-primary)]">{title}</h1>
          {description ? <p className="mt-0.5 text-[0.8125rem] text-[var(--text-muted)]">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}
