import { useState } from 'react';
import { AppDetailsModal } from '@shared/app/components/AppDetailsModal';
import { Brand } from '@shared/app/components/Brand';
import { Footer } from '@shared/app/components/Footer';
import { ProfileMenu } from '@shared/app/components/ProfileMenu';
import { SectionHeading } from '@shared/app/components/SectionHeading';
import { useToast } from '@shared/app/components/ToastProvider';
import { aiApps, discoverApps, yourApps } from '@shared/app/config/appCatalog';
import { useCurrentUser } from '@shared/app/context/UserContext';
import type { CatalogApp } from '@shared/app/types/app';
import { AppCard } from './AppCard';
import { RequestInterestModal } from './RequestInterestModal';
import { SolutionHead } from '@shared/platform/branding/SolutionHead';

function greeting(firstName: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${firstName} ☀️`;
  if (hour < 17) return `Good afternoon, ${firstName} 🌤️`;
  return `Good evening, ${firstName} 🌙`;
}

export function AppHubPage() {
  const { showToast } = useToast();
  const { firstName } = useCurrentUser();
  const [query, setQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<CatalogApp | null>(null);
  const [requestedApp, setRequestedApp] = useState<CatalogApp | null>(null);
  const normalized = query.trim().toLowerCase();
  const filter = (apps: CatalogApp[]) => normalized ? apps.filter((app) => [app.name, app.description, app.category, ...app.keywords].join(' ').toLowerCase().includes(normalized)) : apps;
  const groups = [
    { title: 'Your Apps', apps: filter(yourApps), count: `${yourApps.length} apps` },
    { title: 'AI Tools', apps: filter(aiApps), count: `${aiApps.length} apps` },
    { title: 'Discover More Apps', apps: filter(discoverApps), count: `${discoverApps.length} apps` },
  ];
  const visibleCount = groups.reduce((total, group) => total + group.apps.length, 0);

  return (
    <main className="flex min-h-dvh flex-col bg-[#f4f6fa]">
      <SolutionHead solutionId="platform" pageTitle="App Hub" />
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-xl sm:px-8">
        <Brand compact />
        <div className="flex-1" />
        <label className="hidden w-72 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-400 focus-within:border-brand-navy focus-within:bg-white md:flex">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps" className="w-full bg-transparent text-slate-800 outline-none" aria-label="Search apps" /></label>
        <button type="button" onClick={() => showToast('3 new notifications')} className="relative grid size-10 place-items-center rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50" aria-label="Notifications">🔔<span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" /></button>
        <ProfileMenu />
      </header>

      <section className="hub-premium-hero">
        <div className="hub-premium-hero__glow" aria-hidden="true" />
        <span className="hub-premium-hero__cross" aria-hidden="true">✝</span>
        <div className="hub-premium-hero__content hub-premium-hero__content--compact">
          <div>
            <h1 className="font-serif text-3xl font-bold sm:text-[2.15rem]">{greeting(firstName)}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/72">Everything your organization uses, organized in one secure workspace.</p>
          </div>
        </div>
      </section>

      <div className="px-4 pt-5 md:hidden"><label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 focus-within:border-brand-navy">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps" className="w-full bg-transparent text-slate-800 outline-none" aria-label="Search apps" /></label></div>

      <section className="hub-sections-shell">
        {normalized ? <div className="hub-search-summary"><span><strong>{visibleCount}</strong> results for “{query}”</span><button type="button" onClick={() => setQuery('')}>Clear search</button></div> : null}
        <div className="hub-sections-stack">
          {groups.map((group) => (
            <section key={group.title} className="hub-section-panel">
              <SectionHeading title={group.title} count={group.count} />
              {group.apps.length ? (
                <div className="hub-app-grid">
                  {group.apps.map((app) => <AppCard key={app.id} app={app} onDetails={setSelectedApp} onRequest={setRequestedApp} />)}
                </div>
              ) : (
                <div className="hub-empty-state">No {group.title.toLowerCase()} match “{query}”.</div>
              )}
            </section>
          ))}
        </div>
      </section>
      <Footer />
      <AppDetailsModal app={selectedApp} onClose={() => setSelectedApp(null)} onRequest={(requested) => { setSelectedApp(null); setRequestedApp(requested); }} />
      <RequestInterestModal app={requestedApp} onClose={() => setRequestedApp(null)} />
    </main>
  );
}
