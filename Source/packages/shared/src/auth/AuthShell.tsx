import type { ReactNode } from 'react';
import { Brand } from '@shared/app/components/Brand';
import { Footer } from '@shared/app/components/Footer';
import { ShieldCheckIcon, SparklesIcon } from '@shared/app/components/UiIcons';
import { launchableApps } from '@shared/app/config/appCatalog';
import { SolutionHead } from '@shared/platform/branding/SolutionHead';
import { SOLUTION_REGISTRY, type SolutionId } from '@shared/platform/config/solutionRegistry';

interface AuthShellProps {
  children: ReactNode;
  solutionId?: SolutionId;
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
}

const proofPoints = [
  [String(launchableApps.length), 'Connected apps'],
  ['1,200+', 'Faith resources'],
  ['99.9%', 'Platform uptime'],
] as const;

export function AuthShell({
  children,
  solutionId = 'platform',
  eyebrow = 'One platform. Every mission.',
  title = <>One secure workspace for your Catholic <span className="text-brand-gold-light">community.</span></>,
  description = 'School, parish, finance, communications, content, directory, and support tools—connected in one place.',
}: AuthShellProps) {
  const solution = SOLUTION_REGISTRY[solutionId];

  return (
    <main className="auth-shell">
      <SolutionHead solutionId={solutionId} pageTitle="Sign In" />
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
              {solutionId !== 'platform' ? (
                <div className="auth-solution-context">
                  <span className="auth-solution-context__icon">{launchableApps.find((app) => app.id === solutionId)?.icon ?? '✦'}</span>
                  <span><strong>{solution.name}</strong><small>{solution.category}</small></span>
                </div>
              ) : null}
            </div>

            <div className="auth-workspace-preview">
              <div className="auth-workspace-preview__head">
                <div><span>Connected workspace</span><strong>{launchableApps.length} applications ready</strong></div>
                <span className="auth-workspace-preview__live"><i /> Ready</span>
              </div>
              <div className="auth-workspace-preview__apps">
                {launchableApps.map((app) => (
                  <div key={app.id} className="auth-workspace-app">
                    <span style={{ background: app.gradient }}>{app.icon}</span>
                    <div><strong>{app.name}</strong><small>{app.category}</small></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="auth-proof-grid">
              {proofPoints.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
            </div>

            <div className="auth-brand-panel__trust">
              <span><ShieldCheckIcon size={16} /> Enterprise security</span>
              <span>✝ Mission-driven</span>
              <span>🇺🇸 Built in the USA</span>
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-panel__topbar">
            <div className="lg:hidden"><Brand compact to="/login" local /></div>
            <div className="auth-form-panel__secure"><ShieldCheckIcon size={15} /> Protected {solution.name} access</div>
          </div>
          <div className="auth-form-panel__body">{children}</div>
        </section>
      </div>
      <Footer variant="auth" />
    </main>
  );
}
