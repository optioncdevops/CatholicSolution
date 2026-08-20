import type { ReactNode } from 'react';

interface DashboardHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
}

export function DashboardHeader({ eyebrow, title, description, meta, status, actions }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header__copy">
        {eyebrow ? <p className="dashboard-kicker">{eyebrow}</p> : null}
        <div className="dashboard-header__title-row">
          <h1 className="dashboard-heading">{title}</h1>
          {status}
        </div>
        {description || meta ? (
          <div className="dashboard-header__meta-row">
            {description ? <p className="dashboard-header__description">{description}</p> : null}
            {meta ? <div className="dashboard-header__meta">{meta}</div> : null}
          </div>
        ) : null}
      </div>
      {actions ? <div className="dashboard-header__actions">{actions}</div> : null}
    </header>
  );
}
