import type { ReactNode } from 'react';

type BadgeTone = 'success' | 'warning' | 'neutral' | 'danger' | 'info';

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-[var(--success-bg)] text-[var(--success)]',
  warning: 'bg-[var(--warning-bg)] text-[var(--warning)]',
  neutral: 'bg-[var(--surface-muted)] text-[var(--text-secondary)]',
  danger: 'bg-[var(--error-bg)] text-[var(--error)]',
  info: 'bg-[var(--info-bg)] text-[var(--info)]',
};

/** "inactive" is spelled out as "InActive" everywhere it's displayed, per product convention. */
export function formatStatusLabel(status: string): string {
  return status.toLowerCase() === 'inactive' ? 'InActive' : status.replace('-', ' ');
}

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span id={id} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold capitalize leading-tight ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}

const APPLICATION_STATUS_TONE: Record<string, BadgeTone> = {
  active: 'success', inactive: 'neutral', 'coming-soon': 'info',
};
const ORG_STATUS_TONE: Record<string, BadgeTone> = { active: 'success', inactive: 'neutral', suspended: 'danger' };
const USER_STATUS_TONE: Record<string, BadgeTone> = { active: 'success', pending: 'warning', inactive: 'neutral' };
const REQUEST_STATUS_TONE: Record<string, BadgeTone> = {
  pending: 'warning', approved: 'success', rejected: 'danger', 'info-requested': 'info',
};
const LICENSE_STATUS_TONE: Record<string, BadgeTone> = {
  active: 'success', suspended: 'danger', 'expiring-soon': 'warning', expired: 'danger',
};
const ACCESS_STATUS_TONE: Record<string, BadgeTone> = { active: 'success', 'expiring-soon': 'warning', expired: 'danger' };
const PERMISSION_TONE: Record<string, BadgeTone> = { 'full-control': 'success', 'read-only': 'info', deny: 'danger', mixed: 'neutral' };

const TONE_MAP_BY_KIND: Record<StatusKind, Record<string, BadgeTone>> = {
  application: APPLICATION_STATUS_TONE,
  organization: ORG_STATUS_TONE,
  user: USER_STATUS_TONE,
  request: REQUEST_STATUS_TONE,
  license: LICENSE_STATUS_TONE,
  access: ACCESS_STATUS_TONE,
  permission: PERMISSION_TONE,
};

type StatusKind = 'application' | 'organization' | 'user' | 'request' | 'license' | 'access' | 'permission';

export function StatusBadge({ status, kind }: { status: string; kind: StatusKind }) {
  return <Badge tone={TONE_MAP_BY_KIND[kind][status] ?? 'neutral'}>{formatStatusLabel(status)}</Badge>;
}

const TONE_BORDER_CLASSES: Record<BadgeTone, string> = {
  success: 'border-[var(--success)]',
  warning: 'border-[var(--warning)]',
  neutral: 'border-[var(--line-strong)]',
  danger: 'border-[var(--error)]',
  info: 'border-[var(--info)]',
};

const TONE_SOLID_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-[var(--success)] text-white',
  warning: 'bg-[var(--warning)] text-white',
  neutral: 'bg-[var(--text-secondary)] text-white',
  danger: 'bg-[var(--error)] text-white',
  info: 'bg-[var(--info)] text-white',
};

/** Background + border classes matching a status's badge tone, for highlighting "the current status" in a picker. */
export function getStatusHighlightClasses(status: string, kind: StatusKind): string {
  const tone = TONE_MAP_BY_KIND[kind][status] ?? 'neutral';
  return `${TONE_CLASSES[tone]} ${TONE_BORDER_CLASSES[tone]}`;
}

/** Solid, high-contrast classes (matching a status's tone) for a "Current" chip sitting on top of {@link getStatusHighlightClasses}. */
export function getStatusSolidClasses(status: string, kind: StatusKind): string {
  const tone = TONE_MAP_BY_KIND[kind][status] ?? 'neutral';
  return TONE_SOLID_CLASSES[tone];
}
