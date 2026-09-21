import type { ComponentType } from 'react';
import {
  Building2, ClipboardList, Mail, Package, Receipt, Settings, ShieldCheck, Sparkles, UserCog, Users,
} from 'lucide-react';
import type { AcutisMenuItem, AcutisSubMenuItem } from '../types/authenticationTypes';

const ICON_MAP: Record<string, ComponentType<{ size?: number }>> = {
  Sparkles,
  Package,
  Building2,
  Users,
  ClipboardList,
  Settings,
  UserCog,
  ShieldCheck,
  Mail,
  Receipt,
};

export function resolveMenuIcon(name?: string): ComponentType<{ size?: number }> {
  if (!name) return Settings;
  if (ICON_MAP[name]) return ICON_MAP[name];
  const pascal = name
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return ICON_MAP[pascal] ?? Settings;
}

export function normalizeMenuPath(path?: string): string {
  if (!path) return '/admin';
  if (path === '/admin/applications') return '/admin/products';
  return path;
}

export function splitAdminMenus(menuItems: AcutisMenuItem[] | undefined): {
  topItems: AcutisMenuItem[];
  administration: AcutisMenuItem | undefined;
} {
  const items = Array.isArray(menuItems) ? menuItems : [];
  // Match by the real, stable backend key (`MenuCode` = "liAdministration") — NOT by "does this
  // item merely have any links", which used to be the fallback. Any other top-level module can
  // legitimately carry its own sub-links (e.g. Users -> Reset Password) without being the
  // Administration group, and picking "the first item with links" would wrongly grab whichever
  // one happens to sort earlier by DisplayOrder, silently dropping it from the top nav.
  const administration = items.find((item) => item.sessionKey?.toLowerCase().includes('administration'))
    ?? items.find((item) => (item.links?.length ?? 0) > 0);
  const topItems = items
    .filter((item) => item !== administration)
    .map((item) => ({ ...item, path: normalizeMenuPath(item.path) }));
  return { topItems, administration };
}

export function toDropdownItems(links: AcutisSubMenuItem[] | undefined): Array<{ to: string; label: string; icon: ComponentType<{ size?: number }> }> {
  if (!Array.isArray(links)) return [];
  return links
    .filter((link) => Boolean(link.path))
    .map((link) => ({
      to: normalizeMenuPath(link.path),
      label: link.label,
      icon: resolveMenuIcon(link.icon),
    }));
}

/** Routes that are always reachable regardless of per-role rights — they aren't menu/rights
 * features in `auth.ModuleFeatures` at all (Dashboard is FeatureID 1 and always granted; Profile
 * has no feature row whatsoever). */
const UNGATED_ROUTE_PREFIXES = ['/admin/profile'];
const UNGATED_ROUTES = new Set(['/admin']);

function collectSubMenuPaths(items: AcutisSubMenuItem[] | undefined): string[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => [
    normalizeMenuPath(item.path),
    ...collectSubMenuPaths(item.tablinks),
    ...collectSubMenuPaths(item.activity),
  ]);
}

/** Every route path reachable anywhere in the signed-in user's menu tree (top-level items, their
 * links/btnlinks, and any nested tabs/activities) — this is exactly the set of pages the backend
 * granted this role `AccessRight > 0` for (login only ever sends granted rows; there is no
 * separate "denied" list to check against). */
export function collectMenuRoutes(menuItems: AcutisMenuItem[] | undefined): Set<string> {
  const items = Array.isArray(menuItems) ? menuItems : [];
  const routes = new Set<string>();
  for (const item of items) {
    routes.add(normalizeMenuPath(item.path));
    for (const path of collectSubMenuPaths(item.links)) routes.add(path);
    for (const path of collectSubMenuPaths(item.btnlinks)) routes.add(path);
    for (const path of collectSubMenuPaths(item.activity)) routes.add(path);
  }
  return routes;
}

/** Is this admin route reachable for the signed-in user? Ungated routes (Dashboard, Profile) are
 * always allowed. Everything else must appear in the user's own granted menu routes — this is
 * necessarily only as fresh as their last sign-in (rights changes take effect on next login, the
 * same limitation the rest of this app already has for menu content). */
export function isAdminRouteAllowed(pathname: string, menuItems: AcutisMenuItem[] | undefined): boolean {
  const normalized = normalizeMenuPath(pathname);
  if (UNGATED_ROUTES.has(normalized)) return true;
  if (UNGATED_ROUTE_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) return true;
  const granted = collectMenuRoutes(menuItems);
  if (granted.size === 0) return true; // no menu loaded yet (e.g. still hydrating) — don't false-deny
  return [...granted].some((route) => normalized === route || normalized.startsWith(`${route}/`));
}
