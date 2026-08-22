const DISPLAY_FORMAT = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/** Formats an ISO (`yyyy-MM-dd`) date string as an industry-standard short date, e.g. "Aug 21, 2026". */
export function formatDate(value?: string | null): string {
  if (!value?.trim()) return '—';
  const date = new Date(`${value.trim()}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return DISPLAY_FORMAT.format(date);
}
