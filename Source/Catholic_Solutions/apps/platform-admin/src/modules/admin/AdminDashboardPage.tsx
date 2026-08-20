import { useMemo, useState } from 'react';
import { APP_CATALOG, availableSwitcherApps, externalSaasApps, firstPartyExternalSaasApps, futureApps, linkedExternalSaasApps, partnerExternalSaasApps, yourApps } from '@registry/appCatalog';
import type { CatalogApp } from '@registry/types';
import { Brand } from '@shared/app/components/Brand';
import { ProfileMenu } from '@shared/app/components/ProfileMenu';
import { Footer } from '@shared/app/components/Footer';
import { SolutionHead } from '@shared/platform/branding/SolutionHead';
import './admin.css';

function host(value?: string) {
  if (!value) return 'Not configured';
  try { return new URL(value).host; } catch { return 'Invalid URL'; }
}

function AppRow({ app }: { app: CatalogApp }) {
  return (
    <tr>
      <td><div className="admin-app"><span style={{ background: app.gradient }}>{app.icon}</span><div><strong>{app.name}</strong><small>{app.category}</small></div></div></td>
      <td><span className={`admin-status admin-status--${app.hubSection}`}>{app.hubSection}</span></td>
      <td><span className="admin-model"><strong>External SaaS</strong><small>{app.ownership === 'partner' ? 'Partner-owned' : 'Catholic Solutions-owned'}</small></span></td>
      <td>{app.launcherEnabled && app.hubSection !== 'future' ? 'Linked' : 'Hidden'}</td>
      <td className="admin-domain">{host(app.externalUrl)}</td>
      <td>{app.navigationTarget === 'new-tab' ? 'New tab' : 'Same tab'}</td>
    </tr>
  );
}

export function AdminDashboardPage() {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const rows = useMemo(() => APP_CATALOG.filter((app) => !normalized || [app.name, app.category, app.externalUrl ?? ''].join(' ').toLowerCase().includes(normalized)), [normalized]);

  return (
    <main className="admin-page">
      <SolutionHead solutionId="platform-admin" pageTitle="Super Admin" />
      <header className="admin-topbar">
        <Brand compact />
        <div className="admin-topbar__title"><strong>Super Admin</strong><span>SaaS platform control plane</span></div>
        <div className="admin-topbar__spacer" />
        <a className="admin-link" href="https://cfr.optioncapp.com/apps">Open CFR</a>
        <ProfileMenu />
      </header>

      <section className="admin-shell">
        <div className="admin-heading">
          <div><span className="admin-kicker">Platform operations</span><h1>Catholic Solutions Control Plane</h1><p>Govern independently deployed applications from one registry without coupling product source code to CFR.</p></div>
          <span className="admin-primary" aria-label="Registry management mode">Registry-managed</span>
        </div>

        <div className="admin-kpis">
          <article><span>Registered apps</span><strong>{APP_CATALOG.length}</strong><small>Central catalog</small></article>
          <article><span>Launcher apps</span><strong>{availableSwitcherApps.length}</strong><small>Published destinations</small></article>
          <article><span>External SaaS</span><strong>{externalSaasApps.length}</strong><small>{firstPartyExternalSaasApps.length} first-party · {partnerExternalSaasApps.length} partner</small></article>
          <article><span>Future apps</span><strong>{futureApps.length}</strong><small>Roadmap entries</small></article>
        </div>

        <section className="admin-panel">
          <div className="admin-panel__header">
            <div><h2>Application registry</h2><p>{yourApps.length} subscribed, {APP_CATALOG.length - yourApps.length - futureApps.length} available, {futureApps.length} future · {linkedExternalSaasApps.length} linked now</p></div>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search app or domain" aria-label="Search application registry" />
          </div>
          <div className="admin-table-wrap">
            <table>
              <thead><tr><th>Application</th><th>App Hub</th><th>Model</th><th>Switcher</th><th>Domain</th><th>Launch</th></tr></thead>
              <tbody>{rows.map((app) => <AppRow key={app.id} app={app} />)}</tbody>
            </table>
          </div>
        </section>

        <section className="admin-grid">
          <article className="admin-panel admin-panel--compact"><h2>Architecture boundary</h2><p>CFR and Super Admin are the only product frontends in this repository. Every business application is independently deployed and linked through the registry.</p><ul><li>No external application source under <code>apps/*</code>.</li><li>Registry owns app metadata and launch URLs.</li><li>Switcher is a framework-neutral Web Component.</li></ul></article>
          <article className="admin-panel admin-panel--compact"><h2>Security boundary</h2><p>Each domain owns its own application session. Production SSO should federate through OIDC/OAuth rather than sharing cookies across unrelated domains.</p><ul><li>HTTPS-only production destinations.</li><li>Role-aware admin access at the IdP/API layer.</li><li>Central audit events for registry changes.</li></ul></article>
        </section>
      </section>
      <Footer />
    </main>
  );
}
