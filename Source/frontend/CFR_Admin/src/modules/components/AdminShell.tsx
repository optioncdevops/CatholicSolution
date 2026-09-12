import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { createPortal } from "react-dom";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Bell, ChevronDown, Menu, Settings, X } from "lucide-react";
import { AppLoader } from "@shared/app/components/AppLoader";
import { Brand } from "@shared/app/components/Brand";
import { EmptyState } from "@shared/app/components/EmptyState";
import { Footer } from "@shared/app/components/Footer";
import { ProfileMenu } from "@shared/app/components/ProfileMenu";
import { ACUTIS_AUTH_CHANGED_EVENT } from "@shared/auth/constants/storageKeys";
import { getStoredAcutisAuth } from "@shared/auth/services/authService";
import {
  isAdminRouteAllowed,
  resolveMenuIcon,
  splitAdminMenus,
  toDropdownItems,
} from "@shared/auth/utils/menuHelpers";
import "../theme.css";
import "../admin.css";

const CONTAINER = "mx-auto w-[95%]";

/** Turns a backend-supplied menu title (e.g. "User Roles") into a stable PascalCase id suffix
 * ("UserRoles") — deterministic per menu entry, per the Stable Control IDs standard. */
function toMenuIdSuffix(label: string): string {
  return label
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

interface NavDropdownItem {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
}

/** Shared hover/click dropdown behind both the "Administration" and "Masters" nav menus. */
function NavDropdown({
  id,
  label,
  icon: TriggerIcon,
  items,
}: {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  items: NavDropdownItem[];
}) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
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
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
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
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
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
        id={id}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`}
      >
        <TriggerIcon size={14} />
        <span>{label}</span>
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && panelPosition
        ? createPortal(
            <div
              ref={panelRef}
              role="menu"
              aria-label={label}
              className="admin-nav-dropdown__panel"
              style={{
                position: "fixed",
                top: panelPosition.top,
                left: panelPosition.left,
              }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              {items.map(({ to, label: itemLabel, icon: Icon }) => (
                <NavLink
                  key={to}
                  id={`menuItem${toMenuIdSuffix(itemLabel)}`}
                  to={to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={({ isActive: itemActive }) =>
                    `admin-nav-dropdown__item ${itemActive ? "admin-nav-dropdown__item--active" : ""}`
                  }
                >
                  <span className="admin-nav-dropdown__icon" aria-hidden="true">
                    <Icon size={16} />
                  </span>
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

function isTopNavItemActive(
  itemPath: string | undefined,
  currentPath: string,
): boolean {
  if (!itemPath) return false;
  if (itemPath === "/admin") {
    return currentPath === "/admin" || currentPath === "/admin/";
  }
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export function AdminShell() {
  const location = useLocation();
  const [menuItems, setMenuItems] = useState(
    () => getStoredAcutisAuth()?.resultData?.menuItems ?? [],
  );
  // Below the `md` breakpoint the horizontal nav strip is replaced by this toggled drawer — the
  // strip itself only ever scrolled horizontally on narrow screens, with no way to discover items
  // that scrolled out of view and no actual "mobile menu" control at all.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const refresh = () =>
      setMenuItems(getStoredAcutisAuth()?.resultData?.menuItems ?? []);
    window.addEventListener(ACUTIS_AUTH_CHANGED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(ACUTIS_AUTH_CHANGED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const { topItems, administration } = splitAdminMenus(menuItems);
  const administrationItems = toDropdownItems(administration?.links);
  const AdministrationIcon = resolveMenuIcon(administration?.icon);
  // Real, live route gate — not cosmetic: a role's rights are only as fresh as its last sign-in
  // (the same limitation the nav itself already has), but within that, this actually blocks
  // navigating to a page the signed-in role has no grant for, on every route change.
  const routeAllowed = isAdminRouteAllowed(location.pathname, menuItems);

  return (
    <div className="admin-shell-bg flex min-h-screen flex-col text-[var(--text-primary)]">
      <div className="admin-top-accent" aria-hidden="true" />
      <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/80">
        <div
          className={`flex h-16 items-center justify-between gap-2 border-b border-[var(--line-soft)] sm:gap-4 ${CONTAINER}`}
        >
          <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
            <button
              id="ibtnMobileNavToggle"
              type="button"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
              aria-controls="menuAdminNavigationMobile"
              onClick={() => setMobileNavOpen((value) => !value)}
              className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--hover)] md:hidden"
            >
              {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <Brand compact />
            {/* Purely decorative — hidden below `md` (the same breakpoint the mobile drawer takes
                over at) so the header never has to choose between this and the functional
                notification/profile controls on the right for space on a phone/small tablet. */}
            <span className="admin-plane-badge hidden md:inline-flex">
              CFR Acutis
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              id="ibtnNotifications"
              type="button"
              aria-label="Notifications"
              title="Notifications"
              className="grid size-9 place-items-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--hover)]"
            >
              <Bell size={16} />
            </button>
            <ProfileMenu />
          </div>
        </div>

        <div className="admin-nav-strip hidden md:block">
          <nav
            id="menuAdminNavigation"
            aria-label="Admin navigation"
            className={`admin-nav-scroll flex items-center overflow-x-auto ${CONTAINER}`}
          >
            {topItems.map((item) => {
              const Icon = resolveMenuIcon(item.icon);
              const active = isTopNavItemActive(item.path, location.pathname);
              return (
                <NavLink
                  key={item.sessionKey || item.path}
                  id={`menuItem${toMenuIdSuffix(item.title || item.path || "")}`}
                  to={item.path || "/admin"}
                  end={item.path === "/admin"}
                  className={`admin-nav-item ${active ? "admin-nav-item--active" : ""}`}
                >
                  <Icon size={14} />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
            {administrationItems.length > 0 ? (
              <NavDropdown
                id={`menu${toMenuIdSuffix(administration?.title || "Administration")}`}
                label={administration?.title || "Administration"}
                icon={AdministrationIcon || Settings}
                items={administrationItems}
              />
            ) : null}
          </nav>
        </div>

        {mobileNavOpen ? (
          <nav
            id="menuAdminNavigationMobile"
            aria-label="Admin navigation (mobile)"
            className="admin-nav-mobile md:hidden"
          >
            {topItems.map((item) => {
              const Icon = resolveMenuIcon(item.icon);
              const active = isTopNavItemActive(item.path, location.pathname);
              return (
                <NavLink
                  key={item.sessionKey || item.path}
                  id={`menuItemMobile${toMenuIdSuffix(item.title || item.path || "")}`}
                  to={item.path || "/admin"}
                  end={item.path === "/admin"}
                  onClick={() => setMobileNavOpen(false)}
                  className={`admin-nav-mobile__item ${active ? "admin-nav-mobile__item--active" : ""}`}
                >
                  <Icon size={16} />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
            {administrationItems.length > 0 ? (
              <>
                <p className="admin-nav-mobile__section">
                  {administration?.title || "Administration"}
                </p>
                {administrationItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    id={`menuItemMobile${toMenuIdSuffix(label)}`}
                    to={to}
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) =>
                      `admin-nav-mobile__item admin-nav-mobile__item--nested ${isActive ? "admin-nav-mobile__item--active" : ""}`
                    }
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </>
            ) : null}
          </nav>
        ) : null}
      </header>

      <main className={`flex-1 py-4 ${CONTAINER}`}>
        <div className="admin-page-card">
          {routeAllowed ? (
            <Suspense fallback={<AppLoader label="Loading page" caption="Loading…" />}>
              <Outlet />
            </Suspense>
          ) : (
            <EmptyState
              icon="🚫"
              title="Access denied"
              description="Your role does not have access to this page. Contact an administrator if you believe this is a mistake."
              actionLabel="Back to Dashboard"
              onAction={() => { window.location.href = "/admin"; }}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
