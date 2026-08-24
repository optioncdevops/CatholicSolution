import type { ReactNode } from 'react';

type BadgeTone = 'success' | 'warning' | 'neutral' | 'danger' | 'info';

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-[var(--success-bg)] text-[var(--success)]',
  warning: 'bg-[var(--warning-bg)] text-[var(--warning)]',
  neutral: 'bg-[var(--surface-muted)] text-[var(--text-secondary)]',
  danger: 'bg-[var(--error-bg)] text-[var(--error)]',
  info: 'bg-[var(--info-bg)] text-[var(--info)]',
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold capitalize leading-tight ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}

const APPLICATION_STATUS_TONE: Record<string, BadgeTone> = {
  active: 'success', inactive: 'neutral', 'coming-soon': 'info',
};
const ORG_STATUS_TONE: Record<string, BadgeTone> = { active: 'success', trial: 'info', suspended: 'danger' };
const USER_STATUS_TONE: Record<string, BadgeTone> = { active: 'success', invited: 'info', deactivated: 'neutral' };
const REQUEST_STATUS_TONE: Record<string, BadgeTone> = {
  pending: 'warning', approved: 'success', rejected: 'danger', 'info-requested': 'info',
};
const INVOICE_STATUS_TONE: Record<string, BadgeTone> = {
  created: 'info', paid: 'success', cancelled: 'neutral', overdue: 'danger', 'expiring-soon': 'warning',
};
const ACCESS_STATUS_TONE: Record<string, BadgeTone> = { active: 'success', 'expiring-soon': 'warning', expired: 'danger' };

const TONE_MAP_BY_KIND: Record<StatusKind, Record<string, BadgeTone>> = {
  application: APPLICATION_STATUS_TONE,
  organization: ORG_STATUS_TONE,
  user: USER_STATUS_TONE,
  request: REQUEST_STATUS_TONE,
  invoice: INVOICE_STATUS_TONE,
  access: ACCESS_STATUS_TONE,
};

type StatusKind = 'application' | 'organization' | 'user' | 'request' | 'invoice' | 'access';

export function StatusBadge({ status, kind }: { status: string; kind: StatusKind }) {
  return <Badge tone={TONE_MAP_BY_KIND[kind][status] ?? 'neutral'}>{status.replace('-', ' ')}</Badge>;
}
