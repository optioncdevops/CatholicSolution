import { useEffect, useRef } from 'react';
import type { CatalogApp } from '@shared/app/types/app';

interface AppDetailsModalProps {
  app: CatalogApp | null;
  onClose: () => void;
  onRequest?: (app: CatalogApp) => void;
  onLaunch?: (app: CatalogApp) => void;
}

export function AppDetailsModal({ app, onClose, onRequest, onLaunch }: AppDetailsModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!app) return undefined;
    const originalOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [app, onClose]);

  if (!app) return null;

  const isOrgApproved = Boolean(app.isOrgApproved);
  const ssoLaunch = Boolean(onLaunch && app.productId && app.hubSection === 'your');
  const showRequest = Boolean(onRequest && app.canRequest && app.hubSection === 'available' && !isOrgApproved);
  const isExternal = app.kind === 'external';
  const primaryLabel = ssoLaunch
    ? `${isExternal ? 'Visit site' : 'Launch'} →`
    : isOrgApproved
      ? 'Approved'
      : showRequest
        ? 'Request this app →'
        : app.status === 'coming-soon' ? 'Coming soon' : 'Not available';
  const primaryClass = `action-primary ${ssoLaunch ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 shadow-sm' : 'border border-brand-navy bg-white text-brand-navy hover:bg-brand-navy hover:text-white'}`;
  const statusClass = ssoLaunch && app.kind === 'launchable' ? 'bg-emerald-50 text-emerald-700' : isExternal ? 'bg-slate-100 text-slate-700' : app.kind === 'ai' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700';

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="app-modal-title" aria-describedby="app-modal-description" className="my-6 flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[var(--shadow-elevated)]" onMouseDown={(event) => event.stopPropagation()}>
        <header className="relative flex items-center gap-4 p-5 text-white sm:p-6" style={{ background: app.gradient }}>
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-white/30 bg-white/20 text-2xl">{app.icon}</span>
          <div className="min-w-0"><h2 id="app-modal-title" className="truncate font-display text-xl font-extrabold">{app.name}</h2><span className="mt-2 inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">{app.category}</span></div>
          <button ref={closeRef} type="button" onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl border border-white/15 bg-white/10 font-bold hover:bg-white/20" aria-label="Close app details">✕</button>
        </header>

        <div className="max-h-[68vh] overflow-y-auto p-5 sm:p-6">
          <p id="app-modal-description" className="text-sm leading-7 text-slate-600">{app.description}</p>
          {app.features.length ? <div className="mt-5"><p className="metric-label text-slate-400">Key features</p><div className="mt-2.5 flex flex-wrap gap-2">{app.features.map((feature) => <span key={feature} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">{feature}</span>)}</div></div> : null}

        </div>

        <footer className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
          <span className={`mr-auto rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${statusClass}`}>{app.statusDetail ?? app.statusLabel}</span>
          {ssoLaunch ? (
            <button type="button" onClick={() => { void onLaunch?.(app); onClose(); }} className={primaryClass}>{primaryLabel}</button>
          ) : showRequest ? (
            <button type="button" onClick={() => onRequest?.(app)} className={primaryClass}>{primaryLabel}</button>
          ) : (
            <button
              type="button"
              disabled
              className={`${primaryClass} cursor-default border-slate-300 bg-slate-100 text-slate-500`}
            >
              {primaryLabel}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
