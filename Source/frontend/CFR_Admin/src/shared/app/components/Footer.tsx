import { Brand } from './Brand';
import { ShieldCheckIcon } from './UiIcons';
import { useToast } from './ToastProvider';
import { getAppById } from '@shared/app/config/appCatalog';
import { resolveAppDestination } from '@shared/platform/navigation/solutionNavigation';

interface FooterProps {
  variant?: 'app' | 'auth';
}

export function Footer({ variant = 'app' }: FooterProps) {
  const { showToast } = useToast();
  const auth = variant === 'auth';

  /* Authenticated workspaces use a single compact SaaS row: copyright, mission line, system status. */
  if (!auth) {
    return (
      <footer className="app-footer app-footer--workspace">
        <div className="app-footer__row">
          <span className="app-footer__copyright">© 2026 Catholic Solutions</span>
          <span className="app-footer__mission-inline">Mission-driven technology for Catholic organizations</span>
          <button type="button" className="app-footer__status" onClick={() => showToast('All Catholic Solutions services are operational')}>
            <span className="app-footer__status-dot" aria-hidden="true" />
            All systems operational
          </button>
        </div>
      </footer>
    );
  }

  return (
    <footer className="app-footer app-footer--auth">
      <div className="app-footer__inner">
        <div className="app-footer__brand">
          <Brand compact inverse to="/login" local />
          <span className="app-footer__divider" aria-hidden="true" />
          <p className="app-footer__mission">One platform for Catholic schools, parishes, ministries, and families.</p>
        </div>

        <div className="app-footer__utility">
          <span className="app-footer__secure"><ShieldCheckIcon size={15} /> Secure Catholic Solutions access</span>

          <nav className="app-footer__links" aria-label="Footer navigation">
            <button type="button" onClick={() => showToast('Privacy would open here')}>Privacy</button>
            <button type="button" onClick={() => showToast('Terms would open here')}>Terms</button>
            <a href={resolveAppDestination(getAppById('support-center')!)?.href ?? '#'}>Support</a>
          </nav>
        </div>
      </div>
      <div className="app-footer__legal">
        <span>© 2026 Catholic Solutions. All rights reserved.</span>
        <span>Built in the USA · Mission-driven technology</span>
      </div>
    </footer>
  );
}
