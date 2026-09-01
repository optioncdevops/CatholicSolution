import type { ComponentType } from 'react';
import {
  Building2, ClipboardList, Mail, Package, Receipt, Settings, ShieldCheck, Sparkles, UserCog, Users,
} from 'lucide-react';
import type { AcutisMenuItem, AcutisSubMenuItem } from '../types/authTypes';

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
  const administration = items.find((item) => item.sessionKey === 'Administration' || (item.links?.length ?? 0) > 0);
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
