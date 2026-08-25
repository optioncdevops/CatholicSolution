const DISPLAY_FORMAT = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
const DISPLAY_TIME_FORMAT = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

/** Formats an ISO (`yyyy-MM-dd`) date string as US short date mm/dd/yyyy, e.g. "08/21/2026". */
export function formatDate(value?: string | null): string {
  if (!value?.trim()) return '—';
  const trimmed = value.trim();
  const date = new Date(trimmed.includes('T') ? trimmed : `${trimmed}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return DISPLAY_FORMAT.format(date);
}

/** Formats an ISO date or datetime string as US short date + time, e.g. "08/21/2026, 10:15 AM". */
export function formatDateTime(value?: string | null): string {
  if (!value?.trim()) return '—';
  const trimmed = value.trim();
  const date = new Date(trimmed.includes('T') ? trimmed : `${trimmed}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return `${DISPLAY_FORMAT.format(date)}, ${DISPLAY_TIME_FORMAT.format(date)}`;
}

/** Whole days between an ISO date string and now (positive = in the past). */
export function daysSince(value: string): number {
  const date = new Date(`${value.trim()}T00:00:00`);
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
  return Math.round((Date.now() - date.getTime()) / 86_400_000);
}

/** Formats an ISO date string as a relative label, e.g. "Today", "2 days ago", falling back to the short date past 30 days. */
export function formatRelativeDate(value?: string | null): string {
  if (!value?.trim()) return '—';
  const days = daysSince(value);
  if (!Number.isFinite(days)) return value;
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return formatDate(value);
}

/** Whole days remaining until an ISO date (negative = already past). */
export function daysUntil(value: string): number {
  return -daysSince(value);
}

/** Derives a customer's access status from their subscription expiry date — never stored. */
export function accessStatusOf(expiryDate: string): 'active' | 'expiring-soon' | 'expired' {
  const remaining = daysUntil(expiryDate);
  if (remaining < 0) return 'expired';
  if (remaining <= 30) return 'expiring-soon';
  return 'active';
}

/** Short due-date delta for invoice tables — "3d left" ahead of due, a signed "-15d" once
 * overdue (color carries the "overdue" meaning, so the label stays a plain numeric delta —
 * the industry-standard shorthand for due-date columns). */
export function formatDaysLabel(dueDate: string): string {
  const remaining = daysUntil(dueDate);
  if (remaining === 0) return 'Due today';
  if (remaining > 0) return `${remaining}d left`;
  return `-${Math.abs(remaining)}d`;
}

/** Derives an invoice's effective status live from its due date — 'paid' and 'cancelled' are
 * terminal and always win, otherwise 'overdue' (past due) or 'expiring-soon' (due within 30
 * days, matching {@link accessStatusOf}'s subscription-expiry convention) is computed on read
 * rather than trusted as a stored value, so it never drifts out of date. */
export function effectiveInvoiceStatus<T extends string>(status: T, dueDate: string): T | 'overdue' | 'expiring-soon' {
  if (status === 'paid' || status === 'cancelled') return status;
  const remaining = daysUntil(dueDate);
  if (remaining < 0) return 'overdue';
  if (remaining <= 30) return 'expiring-soon';
  return status;
}
