import { useState } from 'react';
import { AppDetailsModal } from '@shared/app/components/AppDetailsModal';
import { Brand } from '@shared/app/components/Brand';
import { Footer } from '@shared/app/components/Footer';
import { ProfileMenu } from '@shared/app/components/ProfileMenu';
import { SectionHeading } from '@shared/app/components/SectionHeading';
import { useToast } from '@shared/app/components/ToastProvider';
import { BellIcon, SearchIcon } from '@shared/app/components/UiIcons';
import { availableApps, futureApps, yourApps } from '@shared/app/config/appCatalog';
import { useCurrentUser } from '@shared/app/context/UserContext';
import type { CatalogApp } from '@shared/app/types/app';
import { AppCard } from './AppCard';
import { RequestInterestModal } from './RequestInterestModal';
import { SolutionHead } from '@shared/platform/branding/SolutionHead';
import { GlobalAppSwitcher } from '@/appShell/GlobalAppSwitcher';

function greeting(firstName: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${firstName}`;
  if (hour < 17) return `Good afternoon, ${firstName}`;
  return `Good evening, ${firstName}`;
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
    {
      title: 'Your Apps',
      apps: filter(yourApps),
      total: yourApps.length,
      count: `${yourApps.length} active`,
      variant: 'primary',
      note: 'Your organization is subscribed to these workspaces. Launch them any time.',
    },
    {
      title: 'Available Apps',
      apps: filter(availableApps),
      total: availableApps.length,
      count: `${availableApps.length} on request`,
      variant: 'discovery',
      actionMode: 'request' as const,
      note: 'Not in your workspace yet. Request access and Member Services will follow up.',
    },
    {
      title: 'Future Apps',
      apps: filter(futureApps),
      total: futureApps.length,
      count: `${futureApps.length} on the roadmap`,
      variant: 'future',
      hidePrimaryAction: true,
      statusMode: 'upcoming' as const,
      note: 'Coming to the Catholic Solutions platform.',
    },
  ];
  const visibleCount = groups.reduce((total, group) => total + group.apps.length, 0);
  /* Hero summary mirrors the rendered sections; totals come from the same catalog collections. */
  const summary = groups.map((group) => ({ title: group.title, total: group.total }));

  return (
    <main className="hub-page">
      <SolutionHead solutionId="platform" pageTitle="App Hub" />
      <header className="hub-page-header">
        <Brand compact />
        <div className="hub-page-header__spacer" />
        <div className="hub-page-header__actions">
          <GlobalAppSwitcher currentAppId="platform" currentAppName="CFR" />
          <label className="hub-page-header__search">
            <span className="hub-page-header__search-icon" aria-hidden="true"><SearchIcon size={15} /></span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps" aria-label="Search apps" />
          </label>
          <button type="button" onClick={() => showToast('3 new notifications')} className="hub-page-header__notify" aria-label="Notifications">
            <BellIcon size={16} />
            <span className="hub-page-header__notify-dot" aria-hidden="true" />
          </button>
          <span className="hub-page-header__divider" aria-hidden="true" />
          <ProfileMenu />
        </div>
      </header>

      <section className="hub-premium-hero" aria-label="Workspace greeting">
        <div className="hub-premium-hero__glow" aria-hidden="true" />
        <span className="hub-premium-hero__cross" aria-hidden="true">✝</span>
        <div className="hub-premium-hero__content hub-premium-hero__content--compact">
          <div className="hub-premium-hero__copy">
            <h1>{greeting(firstName)}</h1>
            <p>Everything your organization uses, organized in one secure workspace.</p>
          </div>
          <div className="hub-premium-hero__meta" aria-label="Workspace summary">
            {summary.map((item) => (
              <div key={item.title}>
                <strong>{item.total}</strong>
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hub-mobile-search">
        <label className="hub-page-header__search hub-page-header__search--mobile">
          <span className="hub-page-header__search-icon" aria-hidden="true"><SearchIcon size={15} /></span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps" aria-label="Search apps" />
        </label>
      </div>

      <section className="hub-sections-shell">
        {normalized ? (
          <div className="hub-search-summary">
            <span><strong>{visibleCount}</strong> results for “{query}”</span>
            <button type="button" onClick={() => setQuery('')}>Clear search</button>
          </div>
        ) : null}
        <div className="hub-sections-stack">
          {groups.map((group) => (
            <section key={group.title} className={`hub-section-panel hub-section-panel--${group.variant}`}>
              <SectionHeading title={group.title} count={group.count} />
              <p className="hub-section-panel__note">{group.note}</p>
              {group.apps.length ? (
                <div className="hub-app-grid">
                  {group.apps.map((app) => <AppCard key={app.id} app={app} onDetails={setSelectedApp} onRequest={setRequestedApp} hidePrimaryAction={group.hidePrimaryAction} actionMode={group.actionMode} statusMode={group.statusMode} />)}
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
