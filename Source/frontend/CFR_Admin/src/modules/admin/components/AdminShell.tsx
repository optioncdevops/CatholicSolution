import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bell, ChevronDown } from 'lucide-react';
import { Brand } from '@shared/app/components/Brand';
import { Footer } from '@shared/app/components/Footer';
import { ProfileMenu } from '@shared/app/components/ProfileMenu';
import { useAdminNavigation, type AdminNavItem, type NavIcon } from '../navigation/adminNavigation';
import '../theme.css';
import '../admin.css';

const CONTAINER = 'mx-auto w-[95%]';

/** Shared hover/click dropdown behind the "Administration" nav menu (and any future dropdown group). */
function NavDropdown({ label, icon: TriggerIcon, items }: { label: string; icon: NavIcon; items: AdminNavItem[] }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isActive = items.some((item) => location.pathname.startsWith(item.to));

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), 150);
  };

  // The nav strip scrolls horizontally on small screens (overflow-x-auto), which clips any
  // absolutely-positioned child — render the panel in a portal, positioned from the trigger's rect.
  useLayoutEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (rect) setPanelPosition({ top: rect.bottom + 8, left: rect.left });
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeEscape);
    };
  }, []);

  useEffect(() => () => cancelClose(), []);

  return (
    <div
      className="admin-nav-dropdown"
      ref={wrapperRef}
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`}
      >
        <TriggerIcon size={14} />
        <span>{label}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && panelPosition
        ? createPortal(
            <div
              ref={panelRef}
              role="menu"
              aria-label={label}
              className="admin-nav-dropdown__panel"
              style={{ position: 'fixed', top: panelPosition.top, left: panelPosition.left }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              {items.map(({ to, label: itemLabel, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={({ isActive: itemActive }) => `admin-nav-dropdown__item ${itemActive ? 'admin-nav-dropdown__item--active' : ''}`}
                >
                  <span className="admin-nav-dropdown__icon" aria-hidden="true"><Icon size={16} /></span>
                  <span>{itemLabel}</span>
                </NavLink>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function AdminShell() {
  // IsSuperUser was tried as a console-wide gate and reverted — the reference OptionC Acutis
  // system shows ordinary authenticated staff accounts (e.g. Justine Clement) with full
  // navigation, so that flag does not mean "allowed into this console" here. ProtectedRoute
  // already guarantees authentication before this component renders; there is still no confirmed
  // mapping from Acutis's broader moduleRights list to this console's specific sections (see
  // docs/acutis-auth-spec), so per-section authorization remains a future task, not invented here.
  const navigation = useAdminNavigation();

  return (
    <div className="admin-shell-bg flex min-h-screen flex-col text-[var(--text-primary)]">
      <div className="admin-top-accent" aria-hidden="true" />
      <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/80">
        <div className={`flex h-14 items-center gap-4 border-b border-[var(--line-soft)] ${CONTAINER}`}>
          <div className="flex shrink-0 items-center gap-3">
            <Brand compact />
            <span className="admin-plane-badge hidden sm:inline-flex">CFR Acutis</span>
          </div>

          <div className="flex-1" />

          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" aria-label="Notifications" title="Notifications" className="grid size-9 place-items-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--hover)]">
              <Bell size={16} />
            </button>
            <ProfileMenu />
          </div>
        </div>

        <div className="admin-nav-strip">
          <nav aria-label="Admin navigation" className={`admin-nav-scroll flex items-center overflow-x-auto ${CONTAINER}`}>
            {navigation.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </NavLink>
            ))}
            {navigation.groups.map((group) => (
              <NavDropdown key={group.label} label={group.label} icon={group.icon} items={group.items} />
            ))}
          </nav>
        </div>
      </header>

      <main className={`flex-1 py-4 ${CONTAINER}`}>
        <div className="admin-page-card">
          <Suspense fallback={<div className="grid min-h-[40vh] place-items-center"><div className="size-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" aria-label="Loading" /></div>}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
