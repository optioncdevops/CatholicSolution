import { useEffect, useState, type ReactNode } from 'react';
import { Brand } from '@shared/app/components/Brand';
import { Footer } from '@shared/app/components/Footer';
import { ShieldCheckIcon, SparklesIcon } from '@shared/app/components/UiIcons';
import { SolutionHead } from '@shared/platform/branding/SolutionHead';
import { getProducts } from '@/modules/products/services/productsService';
import { productsFromApiResponse } from '@/modules/products/utils/productsHelpers';
import type { CatalogApp } from '@shared/app/types/app';

interface AuthShellProps {
  children: ReactNode;
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
}

export function AuthShell({
  children,
  eyebrow = 'One platform. Every mission.',
  title = <>Welcome back to your Catholic community <span className="text-brand-gold-light">platform.</span></>,
  description = 'One secure sign-in for the school, parish, finance, communications, content, and ministry tools your organization uses every day.',
}: AuthShellProps) {
  const [apps, setApps] = useState<CatalogApp[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await getProducts();
        if (!cancelled) setApps(productsFromApiResponse(response));
      } catch (error) {
        console.error('Error loading products:', error);
        if (!cancelled) setApps(productsFromApiResponse([]));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connectedApps = apps.filter((app) => app.kind === 'launchable' || app.hubSection === 'your' || app.hubSection === 'available');
  const ecosystemApps = apps.filter((app) => app.hubSection === 'future');

  return (
    <main className="auth-shell">
      <SolutionHead pageTitle="Sign In" />
      <div className="auth-shell__main">
        <section className="auth-brand-panel">
          <div className="auth-brand-panel__glow" aria-hidden="true" />
          <div className="auth-brand-panel__cross" aria-hidden="true">✝</div>

          <div className="auth-brand-panel__content">
            <Brand inverse prominent to="/login" local />

            <div className="auth-brand-panel__hero">
              <span className="auth-brand-panel__eyebrow"><SparklesIcon size={14} /> {eyebrow}</span>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>

            <section className="auth-platform-showcase" aria-labelledby="auth-platform-showcase-title">
              <div className="auth-platform-showcase__head">
                <div>
                  <span>Connected Catholic ecosystem</span>
                  <strong id="auth-platform-showcase-title">Everything your organization runs in one place</strong>
                </div>
                <span className="auth-platform-showcase__count" aria-label={`${apps.length} solutions`}>{apps.length} solutions</span>
              </div>

              <div className="auth-platform-showcase__panel">
                <div className="auth-platform-showcase__group">
                  <p className="auth-platform-showcase__label">Connected applications</p>
                  <div className="auth-platform-showcase__grid auth-platform-showcase__grid--core" role="list" aria-label="Connected Catholic Solutions applications">
                    {connectedApps.map((app) => (
                      <div key={app.id} className="auth-platform-app" role="listitem">
                        <span className="auth-platform-app__icon" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
                        <span className="auth-platform-app__copy">
                          <strong title={app.name}>{app.name}</strong>
                          <small title={app.category}>{app.category}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="auth-platform-showcase__group">
                  <p className="auth-platform-showcase__label">Also in the ecosystem</p>
                  <div className="auth-platform-showcase__chips" role="list" aria-label="Additional Catholic Solutions tools">
                    {ecosystemApps.map((app) => (
                      <div
                        key={app.id}
                        className={`auth-platform-chip${app.status === 'coming-soon' ? ' auth-platform-chip--soon' : ''}`}
                        role="listitem"
                        title={`${app.name} · ${app.category}`}
                      >
                        <span className="auth-platform-chip__icon" style={{ background: app.gradient }} aria-hidden="true">{app.icon}</span>
                        <span className="auth-platform-chip__name">{app.shortName}</span>
                        {app.status === 'coming-soon' ? <span className="auth-platform-chip__status">Soon</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="auth-brand-panel__trust">
              <span><ShieldCheckIcon size={15} /> Enterprise security</span>
              <span>✝ Mission-driven</span>
              <span>🇺🇸 Built in the USA</span>
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-panel__topbar">
            <div className="lg:hidden"><Brand compact to="/login" local /></div>
          </div>
          <div className="auth-form-panel__body">{children}</div>
        </section>
      </div>
      <Footer variant="auth" />
    </main>
  );
}
