import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "@app/components/Badge";
import { cn } from "@app/utilities/cn";
import type { AdminApplication } from "@/modules/types";
import { ProductIcon } from "./ProductIcon";

export interface ProductCardProps {
  app: Pick<
    AdminApplication,
    "name" | "category" | "icon" | "gradient" | "description" | "status"
  >;
  linkTo?: string;
  warningCount?: number;
  footer?: ReactNode;
  className?: string;
}

export function ProductCard({
  app,
  linkTo,
  warningCount = 0,
  footer,
  className,
}: ProductCardProps) {
  const identity = (
    <>
      <ProductIcon icon={app.icon} name={app.name} gradient={app.gradient} />
      <div className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "truncate text-sm font-extrabold text-[var(--text-primary)]",
              linkTo && "group-hover:underline",
            )}
          >
            {app.name}
          </span>
          {warningCount > 0 ? (
            <span
              title={`${warningCount} data quality warning${warningCount === 1 ? "" : "s"}`}
              aria-label={`${warningCount} data quality warning${warningCount === 1 ? "" : "s"}`}
            >
              <AlertTriangle
                size={13}
                className="shrink-0 text-[var(--warning)]"
              />
            </span>
          ) : null}
        </span>
        <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">
          {app.category}
        </span>
      </div>
    </>
  );

  return (
    <article
      className={cn(
        "admin-product-card",
        !linkTo && "admin-product-card--static",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        {linkTo ? (
          <Link to={linkTo} className="group flex min-w-0 items-center gap-2.5">
            {identity}
          </Link>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">{identity}</div>
        )}
        <div className="shrink-0 pt-0.5">
          <StatusBadge status={app.status} kind="application" />
        </div>
      </div>
      <p className="admin-product-card__description">
        {app.description || "No description yet."}
      </p>
      {footer ? (
        <div className="mt-auto">
          <div className="admin-product-card__divider" />
          {footer}
        </div>
      ) : null}
    </article>
  );
}
