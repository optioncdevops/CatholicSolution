import { Brand } from './Brand';
import { ShieldCheckIcon } from './UiIcons';
import { useToast } from './ToastProvider';
import { useSolutionNavigation } from '@shared/platform/navigation/solutionNavigation';

interface FooterProps {
  variant?: 'app' | 'auth';
}

export function Footer({ variant = 'app' }: FooterProps) {
  const { showToast } = useToast();
  const { goToSolution } = useSolutionNavigation();
  const auth = variant === 'auth';

  return (
    <footer className={`app-footer ${auth ? 'app-footer--auth' : ''}`}>
      <div className="app-footer__inner">
        <div className="app-footer__brand">
          <Brand compact inverse to={auth ? '/login' : '/apps'} local={auth} />
          <span className="app-footer__divider" aria-hidden="true" />
          <p className="app-footer__mission">One platform for Catholic schools, parishes, ministries, and families.</p>
        </div>

        <div className="app-footer__utility">
          {!auth ? (
            <button type="button" className="app-footer__status" onClick={() => showToast('All Catholic Solutions services are operational')}>
              <span className="app-footer__status-dot" aria-hidden="true" />
              All systems operational
            </button>
          ) : (
            <span className="app-footer__secure"><ShieldCheckIcon size={15} /> Secure Catholic Solutions access</span>
          )}

          <nav className="app-footer__links" aria-label="Footer navigation">
            <button type="button" onClick={() => showToast('Privacy would open here')}>Privacy</button>
            <button type="button" onClick={() => showToast('Terms would open here')}>Terms</button>
            <button type="button" onClick={() => goToSolution('support-center')}>Support</button>
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
