// Shared Recharts color/sizing tokens for the admin dashboard's charts. CSS custom properties
// (e.g. "var(--success)") work directly as Recharts fill/stroke values, so charts stay in sync
// with the app's light/dark theme automatically instead of hardcoding hex values here.
export const CHART_STATUS_COLORS = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--error)',
  neutral: 'var(--text-faint)',
  info: 'var(--info)',
  primary: 'var(--primary)',
} as const;

export const CHART_HEIGHT = 220;
export const CHART_GRID_STROKE = 'var(--line-soft)';
export const CHART_AXIS_TICK = { fill: 'var(--text-faint)', fontSize: 11, fontWeight: 600 };
