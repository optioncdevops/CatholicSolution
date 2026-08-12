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
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-[var(--shadow-soft)]">
      <span className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="metric-label text-slate-400">{label}</p>
          <p className="metric-value">{value}</p>
        </div>
        {icon ? <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-lg text-slate-700">{icon}</span> : null}
      </div>
      {detail ? <p className="mt-2.5 text-xs font-semibold leading-5 text-slate-500">{detail}</p> : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </article>
  );
}
