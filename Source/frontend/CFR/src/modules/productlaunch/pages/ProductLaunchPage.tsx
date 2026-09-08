import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppDetailsModal } from '@shared/app/components/AppDetailsModal';
import { Brand } from '@shared/app/components/Brand';
import { Footer } from '@shared/app/components/Footer';
import { ProfileMenu } from '@shared/app/components/ProfileMenu';
import { SectionHeading } from '@shared/app/components/SectionHeading';
import { useToast } from '@shared/app/components/ToastProvider';
import { BellIcon, SearchIcon } from '@shared/app/components/UiIcons';
import { useCurrentUser } from '@shared/app/context/UserContext';
import type { CatalogApp } from '@shared/app/types/app';
import { getAssignedProducts, launchProduct } from '../services/productLaunchService';
import { hubProductsFromResponse } from '../utils/productLaunchHelpers';
import { validateLaunchProduct } from '../validator/ProductLaunchValidator';
import { AppCard } from './partials/AppCard';
import { RequestInterestModal } from './partials/RequestInterestModal';
import { SolutionHead } from '@shared/platform/branding/SolutionHead';

function greeting(firstName: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${firstName}`;
  if (hour < 17) return `Good afternoon, ${firstName}`;
  return `Good evening, ${firstName}`;
}

export default function ProductLaunchPage() {
  //#region Hooks
  const { showToast } = useToast();
  const { firstName } = useCurrentUser();
  //#endregion

  //#region States
  const [query, setQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<CatalogApp | null>(null);
  const [requestedApp, setRequestedApp] = useState<CatalogApp | null>(null);
  const [requestedAppIds, setRequestedAppIds] = useState<string[]>([]);
  const [apps, setApps] = useState<CatalogApp[]>([]);
  const [loading, setLoading] = useState(true);
  //#endregion

  //#region Functions
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const assignedResponse = await getAssignedProducts();
      setApps(hubProductsFromResponse(assignedResponse));
    } catch (error) {
      console.error('Error loading products:', error);
      showToast(typeof error === 'string' ? error : 'Failed to load products.');
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);
  //#endregion

  //#region Functions
  const normalized = query.trim().toLowerCase();
  const filter = (items: CatalogApp[]) => (normalized ? items.filter((app) => [app.name, app.description, app.category, ...app.keywords].join(' ').toLowerCase().includes(normalized)) : items);
  const yourApps = useMemo(() => apps.filter((app) => app.hubSection === 'your'), [apps]);
  const availableApps = useMemo(() => apps.filter((app) => app.hubSection === 'available'), [apps]);
  const futureApps = useMemo(() => apps.filter((app) => app.hubSection === 'future' || (app.hubSection !== 'your' && app.hubSection !== 'available')), [apps]);
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
  const summary = groups.map((group) => ({ title: group.title, total: group.total }));
  //#endregion

  //#region Handlers
  const openRequestModal = useCallback((app: CatalogApp) => {
    if (requestedAppIds.includes(app.id)) return;
    setSelectedApp(null);
    setRequestedApp(app);
  }, [requestedAppIds]);

  const closeRequestModal = useCallback(() => {
    setRequestedApp(null);
  }, []);

  const handleLaunch = useCallback(async (app: CatalogApp) => {
    const messages = validateLaunchProduct(app.productId);
    if (messages.length) {
      showToast(messages.join(' '));
      return;
    }
    try {
      const { launchUrl } = await launchProduct(app.productId as number);
      showToast(`Launching ${app.name}.`);
      if (app.navigationTarget === 'new-tab') {
        window.open(launchUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      window.location.assign(launchUrl);
    } catch (error) {
      console.error('Error launching product:', error);
      showToast(typeof error === 'string' ? error : `Failed to launch ${app.name}.`);
    }
  }, [showToast]);

  const handleRequestSubmitted = useCallback((app: CatalogApp) => {
    setRequestedAppIds((current) => (current.includes(app.id) ? current : [...current, app.id]));
  }, []);
  //#endregion

  //#region Render
  return (
    <main className="hub-page">
      <SolutionHead solutionId="platform" pageTitle="App Hub" />
      <header className="hub-page-header">
        <Brand compact />
        <div className="hub-page-header__spacer" />
        <div className="hub-page-header__actions">
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
          {loading ? (
            <div className="hub-empty-state">Loading apps…</div>
          ) : groups.map((group) => (
            <section key={group.title} className={`hub-section-panel hub-section-panel--${group.variant}`}>
              <SectionHeading title={group.title} count={group.count} />
              <p className="hub-section-panel__note">{group.note}</p>
              {group.apps.length ? (
                <div className="hub-app-grid">
                  {group.apps.map((app) => (
                    <AppCard
                      key={`${app.hubSection}-${app.id}-${app.name}`}
                      app={app}
                      onDetails={setSelectedApp}
                      onRequest={openRequestModal}
                      onLaunch={handleLaunch}
                      hidePrimaryAction={group.hidePrimaryAction}
                      actionMode={group.actionMode}
                      statusMode={group.statusMode}
                      alreadyRequested={requestedAppIds.includes(app.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="hub-empty-state">{normalized ? `No ${group.title.toLowerCase()} match “${query}”.` : `No ${group.title.toLowerCase()} yet.`}</div>
              )}
            </section>
          ))}
        </div>
      </section>
      <Footer />
      <AppDetailsModal app={selectedApp} onClose={() => setSelectedApp(null)} onRequest={openRequestModal} onLaunch={handleLaunch} />
      <RequestInterestModal app={requestedApp} onClose={closeRequestModal} onSubmitted={handleRequestSubmitted} />
    </main>
  );
  //#endregion
}
