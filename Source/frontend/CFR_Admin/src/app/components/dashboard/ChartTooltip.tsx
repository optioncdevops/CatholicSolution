import type { TooltipContentProps } from 'recharts';

// A single custom tooltip reused by every Recharts chart on the dashboard, styled to match the
// app's card surface instead of Recharts' default plain-white tooltip. Recharts v3 moved
// active/payload/label off TooltipProps onto TooltipContentProps (the shape actually passed to
// a custom `content` renderer), so that's the type used here.
export function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs shadow-[var(--shadow-elevated)]">
      {label ? <p className="mb-1 font-bold text-[var(--text-primary)]">{label}</p> : null}
      <ul className="flex flex-col gap-0.5">
        {payload.map((entry, index) => (
          <li key={String(entry.dataKey ?? index)} className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full" style={{ background: entry.color }} aria-hidden="true" />
            <span className="text-[var(--text-secondary)]">{entry.name}:</span>
            <span className="font-bold text-[var(--text-primary)]">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
