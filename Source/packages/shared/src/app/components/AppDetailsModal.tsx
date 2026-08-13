import { useEffect, useRef, useState } from 'react';
import type { CatalogApp } from '@shared/app/types/app';
import { resolveAppUrl, resolvePlatformUrl } from '@shared/platform/navigation/solutionNavigation';

interface AppDetailsModalProps {
  app: CatalogApp | null;
  onClose: () => void;
  onRequest?: (app: CatalogApp) => void;
}

export function AppDetailsModal({ app, onClose, onRequest }: AppDetailsModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Collapse the expanded section when a different app is opened. Adjusted during render
  // rather than in an effect: resetting state from an effect body queues a second render
  // pass, so the modal would briefly paint the previous app's expanded state.
  const [renderedApp, setRenderedApp] = useState(app);
  if (app !== renderedApp) {
    setRenderedApp(app);
    setExpanded(false);
  }

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

  const isExternal = app.kind === 'external';
  const unpublished = isExternal && !app.externalUrl;

  // App Hub navigation intentionally stays in the current tab. Users can still use the
  // browser's native context-menu / modifier-key behavior when they want another tab.
  const target = app.route ? resolveAppUrl(app) : app.externalUrl;
  const deploymentPending = Boolean(app.route) && !target;
  const requestTarget = !target && !unpublished && !deploymentPending ? resolvePlatformUrl(`/request-access?product=${encodeURIComponent(app.id)}`) : '';
  const primaryLabel = deploymentPending ? 'Deployment pending' : app.route ? 'Launch →' : isExternal ? (unpublished ? 'Coming soon' : 'Visit site →') : 'Request this app →';
  const primaryClass = `action-primary ${app.route || app.externalUrl ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 shadow-sm' : 'border border-brand-navy bg-white text-brand-navy hover:bg-brand-navy hover:text-white'}`;
  const details = app.details;
  const statusClass = app.route ? 'bg-emerald-50 text-emerald-700' : isExternal ? 'bg-slate-100 text-slate-700' : app.kind === 'ai' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700';

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
          {app.stats.length ? <div className="mt-5"><p className="metric-label text-slate-400">At a glance</p><div className="mt-2.5 grid gap-2 sm:grid-cols-2">{app.stats.map((stat) => <div key={`${stat.value}-${stat.label}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5"><div className="font-display text-base font-extrabold text-slate-900">{stat.value}</div><div className="mt-1 text-[11px] font-semibold text-slate-500">{stat.label}</div></div>)}</div></div> : null}

          {details ? (
            <>
              <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs font-extrabold text-violet-700 hover:border-violet-200 hover:bg-violet-50">
                {expanded ? 'Show less details' : 'Show more details'} <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>⌄</span>
              </button>
              {expanded ? (
                <div className="pt-5">
                  <p className="text-[13px] leading-6 text-slate-600">{details.longDescription}</p>
                  <div className="mt-5"><p className="metric-label text-slate-400">What's included</p><div className="mt-2 grid gap-2">{details.included.map((item) => <div key={item} className="flex gap-2 text-xs leading-5 text-slate-600"><span className="font-extrabold text-emerald-600">✓</span><span>{item}</span></div>)}</div></div>
                  <div className="mt-5"><p className="metric-label text-slate-400">Works well with</p><div className="mt-2 flex flex-wrap gap-2">{details.integrations.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-brand-navy">{item}</span>)}</div></div>
                  {details.activity?.length ? <div className="mt-5"><p className="metric-label text-slate-400">Recent activity</p><div className="mt-2 divide-y divide-slate-100">{details.activity.map((item) => <div key={item.title} className="flex gap-3 py-2.5"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" /><span><strong className="block text-xs text-slate-700">{item.title}</strong>{item.meta ? <span className="mt-0.5 block text-[11px] text-slate-400">{item.meta}</span> : null}</span></div>)}</div></div> : null}
                  {details.steps?.length ? <div className="mt-5"><p className="metric-label text-slate-400">Getting started</p><div className="mt-2 divide-y divide-slate-100">{details.steps.map((step, index) => <div key={step} className="flex gap-3 py-2.5"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-violet-600" /><strong className="text-xs leading-5 text-slate-700">{index + 1}. {step}</strong></div>)}</div></div> : null}
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <footer className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
          <span className={`mr-auto rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide ${statusClass}`}>{app.statusDetail ?? app.statusLabel}</span>
          {target ? (
            <a href={target} onClick={onClose} className={primaryClass}>{primaryLabel}</a>
          ) : deploymentPending ? (
            <button type="button" disabled className={`${primaryClass} cursor-default border-slate-300 bg-slate-100 text-slate-500`}>{primaryLabel}</button>
          ) : onRequest && !unpublished ? (
            <button type="button" onClick={() => onRequest(app)} className={primaryClass}>{primaryLabel}</button>
          ) : requestTarget ? (
            <a href={requestTarget} onClick={onClose} className={primaryClass}>{primaryLabel}</a>
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
