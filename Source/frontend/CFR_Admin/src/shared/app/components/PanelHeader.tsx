import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PanelHeaderProps {
  title: string;
  action?: ReactNode;
  /** Optional back-link, e.g. { label: 'Products', to: '/admin/applications' }. */
  breadcrumb?: { label: string; to: string };
  /** Optional leading visual (e.g. a product's icon tile), placed left of the title on its own row. */
  icon?: ReactNode;
  /** Optional line rendered under the title (e.g. a category or type label). */
  subtitle?: ReactNode;
}

export function PanelHeader({ title, action, breadcrumb, icon, subtitle }: PanelHeaderProps) {
  return (
    <div className="admin-panel-header">
      <div className="flex min-w-0 items-center gap-3">
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <div className="min-w-0">
          {breadcrumb ? (
            <Link to={breadcrumb.to} className="admin-panel-header__breadcrumb">
              <ChevronLeft size={12} /> {breadcrumb.label}
            </Link>
          ) : null}
          <h1 className="admin-panel-header__title"><span className="admin-panel-header__title-accent" aria-hidden="true" />{title}</h1>
          {subtitle ? <p className="admin-panel-header__subtitle">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="admin-panel-header__action">{action}</div> : null}
    </div>
  );
}
