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
  active: 'success', inactive: 'neutral', 'coming-soon': 'info', 'on-request': 'warning', archived: 'danger',
};
const ORG_STATUS_TONE: Record<string, BadgeTone> = { active: 'success', trial: 'info', suspended: 'danger' };
const USER_STATUS_TONE: Record<string, BadgeTone> = { active: 'success', invited: 'info', deactivated: 'neutral' };
const REQUEST_STATUS_TONE: Record<string, BadgeTone> = {
  pending: 'warning', approved: 'success', rejected: 'danger', 'info-requested': 'info',
};

export function StatusBadge({ status, kind }: { status: string; kind: 'application' | 'organization' | 'user' | 'request' }) {
  const toneMap = kind === 'application' ? APPLICATION_STATUS_TONE
    : kind === 'organization' ? ORG_STATUS_TONE
      : kind === 'user' ? USER_STATUS_TONE
        : REQUEST_STATUS_TONE;
  return <Badge tone={toneMap[status] ?? 'neutral'}>{status.replace('-', ' ')}</Badge>;
}
