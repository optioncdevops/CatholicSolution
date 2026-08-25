import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  accentClass?: string;
  footer?: ReactNode;
}

export function KpiCard({ label, value, detail, icon, accentClass = 'bg-brand-gold', footer }: KpiCardProps) {
  return (
    <article className="kpi-card relative overflow-hidden border border-[var(--line)] bg-[var(--surface)] p-4 text-[var(--text-primary)] shadow-[var(--shadow-soft)]">
      <span className={`absolute inset-x-0 top-0 h-0.5 ${accentClass}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="metric-label text-[var(--text-faint)]">{label}</p>
          <p className="metric-value">{value}</p>
        </div>
        {icon ? <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] text-base text-[var(--text-secondary)]">{icon}</span> : null}
      </div>
      {detail ? <p className="mt-2 text-[0.6875rem] font-semibold leading-5 text-[var(--text-muted)]">{detail}</p> : null}
      {footer ? <div className="mt-3">{footer}</div> : null}
    </article>
  );
}
