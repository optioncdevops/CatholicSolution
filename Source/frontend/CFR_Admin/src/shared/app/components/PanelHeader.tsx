import type { ReactNode } from 'react';

interface PanelHeaderProps {
  title: string;
  action?: ReactNode;
  /** Optional leading visual (e.g. a product's icon tile), placed left of the title. */
  icon?: ReactNode;
  /** Extra class(es) on the header root. */
  className?: string;
}

/** Every page title strip is icon + title + action only — no breadcrumb and no subtitle line,
 * so the header stays a single compact row everywhere. */
export function PanelHeader({ title, action, icon, className }: PanelHeaderProps) {
  return (
    <div className={`admin-panel-header${className ? ` ${className}` : ''}`}>
      <div className="flex min-w-0 items-center gap-3">
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <h1 className="admin-panel-header__title"><span className="admin-panel-header__title-accent" aria-hidden="true" />{title}</h1>
      </div>
      {action ? <div className="admin-panel-header__action">{action}</div> : null}
    </div>
  );
}
