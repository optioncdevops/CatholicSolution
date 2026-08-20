import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Brand } from '@shared/app/components/Brand';
import { Footer } from '@shared/app/components/Footer';
import { ProfileMenu } from '@shared/app/components/ProfileMenu';
import {
  AppsIcon, BellIcon, BuildingIcon, ClipboardIcon, SearchIcon, SparklesIcon, UsersIcon,
} from '@shared/app/components/UiIcons';
import '../admin.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: SparklesIcon, end: true },
  { to: '/admin/applications', label: 'Applications', icon: AppsIcon },
  { to: '/admin/organizations', label: 'Organizations', icon: BuildingIcon },
  { to: '/admin/users', label: 'Users', icon: UsersIcon },
  { to: '/admin/requests', label: 'Requests', icon: ClipboardIcon },
  { to: '/admin/settings', label: 'Settings', icon: BellIcon },
];

const BREADCRUMB_LABELS: Record<string, string> = {
  admin: 'Dashboard', applications: 'Applications', organizations: 'Organizations',
  users: 'Users', requests: 'Requests', settings: 'Settings', new: 'New',
};

const CONTAINER = 'mx-auto w-[95%]';

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; to: string }[] = [];
  let path = '';
  for (const segment of segments) {
    path += `/${segment}`;
    crumbs.push({ label: BREADCRUMB_LABELS[segment] ?? decodeURIComponent(segment), to: path });
  }
  return crumbs;
}

export function AdminShell() {
  const crumbs = useBreadcrumbs();
  const showBreadcrumbs = crumbs.length > 1;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-app)] text-[var(--text-primary)]">
      <div className="admin-top-accent" aria-hidden="true" />
      <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/80">
        <div className={`flex h-14 items-center gap-4 border-b border-[var(--line-soft)] ${CONTAINER}`}>
          <div className="flex shrink-0 items-center gap-3">
            <Brand compact />
            <span className="admin-plane-badge hidden sm:inline-flex">Control Plane</span>
          </div>

          <label className="relative hidden max-w-sm flex-1 sm:block">
            <span className="sr-only">Search the control plane</span>
            <SearchIcon size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
            <input
              type="search"
              placeholder="Search applications, organizations, users…"
              className="w-full rounded-full border border-[var(--line)] bg-[var(--surface-muted)] py-2 pl-8 pr-3 text-xs font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-faint)] focus:border-[var(--secondary)] focus:bg-[var(--surface)]"
            />
          </label>

          <div className="flex-1" />

          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" aria-label="Notifications" className="grid size-9 place-items-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--hover)]">
              <BellIcon size={16} />
            </button>
            <ProfileMenu />
          </div>
        </div>

        <div className="border-b border-[var(--line)] bg-[var(--surface-muted)]">
          <nav aria-label="Admin navigation" className={`admin-nav-scroll flex items-center gap-1 overflow-x-auto ${CONTAINER}`}>
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
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
          </nav>
        </div>
      </header>

      {showBreadcrumbs ? (
        <nav aria-label="Breadcrumb" className="border-b border-[var(--line-soft)] bg-[var(--surface)]">
          <div className={`flex min-w-0 items-center gap-1.5 overflow-x-auto py-2 text-xs font-semibold text-[var(--text-muted)] ${CONTAINER}`}>
            {crumbs.map((crumb, index) => (
              <span key={crumb.to} className="flex shrink-0 items-center gap-1.5">
                {index > 0 ? <span aria-hidden="true" className="text-[var(--text-faint)]">/</span> : null}
                {index === crumbs.length - 1 ? (
                  <span className="text-[var(--text-primary)]" aria-current="page">{crumb.label}</span>
                ) : (
                  <Link to={crumb.to} className="hover:text-[var(--text-primary)]">{crumb.label}</Link>
                )}
              </span>
            ))}
          </div>
        </nav>
      ) : null}

      <main className={`flex-1 py-6 ${CONTAINER}`}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
