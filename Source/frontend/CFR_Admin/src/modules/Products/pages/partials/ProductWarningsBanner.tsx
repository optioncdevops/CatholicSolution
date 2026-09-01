import { AlertTriangle } from 'lucide-react';
import type { ProductWarning } from '../../validator/productValidation';

export function ProductWarningsBanner({ warnings }: { warnings: ProductWarning[] }) {
  if (warnings.length === 0) return null;

  return (
    <div role="alert" className="flex flex-col gap-1.5 rounded-[var(--radius-panel)] border border-[var(--warning)] bg-[var(--warning-bg)] p-3">
      <p className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--warning)]">
        <AlertTriangle size={14} /> {warnings.length} data quality {warnings.length === 1 ? 'warning' : 'warnings'}
      </p>
      <ul className="flex flex-col gap-1 pl-5 text-xs font-semibold text-[var(--warning)]" style={{ listStyleType: 'disc' }}>
        {warnings.map((warning) => <li key={warning.id}>{warning.message}</li>)}
      </ul>
    </div>
  );
}
