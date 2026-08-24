const DISPLAY_FORMAT = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/** Formats an ISO (`yyyy-MM-dd`) date string as an industry-standard short date, e.g. "Aug 21, 2026". */
export function formatDate(value?: string | null): string {
  if (!value?.trim()) return '—';
  const date = new Date(`${value.trim()}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return DISPLAY_FORMAT.format(date);
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

/** Short "N days left" / "N days overdue" label used in invoice tables. */
export function formatDaysLabel(dueDate: string): string {
  const remaining = daysUntil(dueDate);
  if (remaining === 0) return 'Due today';
  if (remaining > 0) return `${remaining}d left`;
  return `${Math.abs(remaining)}d overdue`;
}
