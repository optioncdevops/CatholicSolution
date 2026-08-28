import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@app/utilities/cn';
import { StatusBadge } from '@app/components/Badge';
import type { AdminApplication } from '../types';

/** An uploaded logo is stored as a data URL; anything else (an emoji) renders as text. */
function isImageIcon(icon: string): boolean {
  return icon.startsWith('data:') || /^https?:\/\//.test(icon);
}

function ProductIcon({ icon, gradient }: { icon: string; gradient: string }) {
  if (isImageIcon(icon)) {
    return <img src={icon} alt="" className="size-9 shrink-0 rounded-lg object-cover" aria-hidden="true" />;
  }
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg text-sm text-white" style={{ background: gradient }} aria-hidden="true">
      {icon}
    </span>
  );
}

interface ProductCardProps {
  app: Pick<AdminApplication, 'name' | 'category' | 'icon' | 'gradient' | 'description' | 'status'>;
  /** When set, the icon/name/subtitle link to the product's view page and the card gets the
   * hover-lift affordance; omit for a static preview (edit form, view-page preview panel). */
  linkTo?: string;
  /** Data-quality warning count — only meaningful for the linked list-card usage. */
  warningCount?: number;
  /** Divider + footer content (e.g. customer count and row actions), list-card only. */
  footer?: ReactNode;
  className?: string;
}

/** The one product card layout — used by the Products list, and reused as the static preview
 * in the product view/edit pages so every "what does this product look like" surface matches. */
export function ProductCard({ app, linkTo, warningCount = 0, footer, className }: ProductCardProps) {
  const identity = (
    <>
      <ProductIcon icon={app.icon} gradient={app.gradient} />
      <div className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className={cn('truncate text-sm font-extrabold text-[var(--text-primary)]', linkTo && 'group-hover:underline')}>{app.name}</span>
          {warningCount > 0 ? (
            <span title={`${warningCount} data quality warning${warningCount === 1 ? '' : 's'}`} aria-label={`${warningCount} data quality warning${warningCount === 1 ? '' : 's'}`}>
              <AlertTriangle size={13} className="shrink-0 text-[var(--warning)]" />
            </span>
          ) : null}
        </span>
        <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">{app.category}</span>
      </div>
    </>
  );

  return (
    <article className={cn('admin-product-card relative', !linkTo && 'admin-product-card--static', className)}>
      <div className="absolute right-[0.85rem] top-3">
        <StatusBadge status={app.status} kind="application" />
      </div>

      <div className="flex items-center gap-2.5 pr-16">
        {linkTo ? (
          <Link to={linkTo} className="group flex min-w-0 items-center gap-2.5">{identity}</Link>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">{identity}</div>
        )}
      </div>

      <p className="admin-product-card__description">{app.description || 'No description yet.'}</p>

      {footer ? (
        <>
          <div className="admin-product-card__divider" />
          {footer}
        </>
      ) : null}
    </article>
  );
}
