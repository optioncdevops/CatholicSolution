import type { ReactNode } from 'react';

interface PanelHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PanelHeader({ title, description, action }: PanelHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="panel-title text-slate-900">{title}</h2>
        {description ? <p className="panel-subtitle">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
