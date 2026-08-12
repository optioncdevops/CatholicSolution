import type { ReactNode } from 'react';

interface DashboardHeaderProps {
  eyebrow?: string;
  title: string;
  status?: ReactNode;
  actions?: ReactNode;
}

export function DashboardHeader({ eyebrow, title, status, actions }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="min-w-0">
        {eyebrow ? <p className="dashboard-kicker text-slate-400">{eyebrow}</p> : null}
        <div className="dashboard-header__title-row">
          <h1 className="dashboard-heading text-slate-900">{title}</h1>
          {status}
        </div>
      </div>
      {actions ? <div className="dashboard-header__actions">{actions}</div> : null}
    </header>
  );
}
