import { useMemo } from 'react';
import type { ComponentType } from 'react';
import { Building2, ClipboardList, Mail, Package, Receipt, Settings, ShieldCheck, Sparkles, UserCog, Users } from 'lucide-react';

export type NavIcon = ComponentType<{ size?: number }>;

export interface AdminNavItem {
  to: string;
  label: string;
  icon: NavIcon;
  end?: boolean;
}

export interface AdminNavDropdownGroup {
  label: string;
  icon: NavIcon;
  items: AdminNavItem[];
}

export interface AdminNavigation {
  items: AdminNavItem[];
  groups: AdminNavDropdownGroup[];
}

/**
 * Single source of truth for the admin nav strip's content — moved out of AdminShell.tsx so the
 * source can be swapped for a real API call in one place once a CFR_Admin-specific menu endpoint
 * exists.
 *
 * IMPORTANT: CFR.Acutis's real `/Auth/Login` and `/Navigation/Menus` responses already carry a
 * live-verified, database-driven menu tree (`menuItems` — see
 * docs/acutis-auth-spec/database-contract.md) — but that tree is the LEGACY classic OptionC
 * system's own navigation (Schools, Tickets, Reports, Comments, etc.), not CFR_Admin's pages.
 * There is no confirmed overlap between the two beyond the label "Administration", which means
 * two entirely different things in each system. Wiring that tree in here directly would produce
 * mostly-dead links and one actively-misleading match — see the session record for the live
 * comparison that established this. Until a CFR_Admin-specific endpoint exists, this function
 * returns the console's own known-good, working destinations.
 */
export function useAdminNavigation(): AdminNavigation {
  return useMemo<AdminNavigation>(() => ({
    items: [
      { to: '/admin', label: 'Dashboard', icon: Sparkles, end: true },
      { to: '/admin/applications', label: 'Products', icon: Package },
      { to: '/admin/organizations', label: 'Organizations', icon: Building2 },
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/requests', label: 'Requests', icon: ClipboardList },
    ],
    groups: [
      {
        label: 'Administration',
        icon: Settings,
        items: [
          { to: '/admin/administration/user-roles', label: 'User Roles', icon: UserCog },
          { to: '/admin/administration/rights', label: 'Rights', icon: ShieldCheck },
          { to: '/admin/administration/email-templates', label: 'Email Template', icon: Mail },
          { to: '/admin/administration/invoice-items', label: 'License Items', icon: Receipt },
          // Component library (Add/View) pages intentionally have no nav entry — reach them by
          // direct URL only. Routes still live in App.tsx; see the removal note atop SampleAddPage.tsx.
        ],
      },
    ],
  }), []);
}
