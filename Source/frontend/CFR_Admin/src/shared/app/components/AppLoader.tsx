// In-app loading indicator — the Suspense/async-boundary counterpart to the inline boot
// preloader in index.html (same gold ring + accent-bar visual language, sized for a light
// surface instead of the boot splash's full-screen navy overlay). Reuse this instead of a
// one-off spinner wherever a route or panel needs a branded "loading" state.
interface AppLoaderProps {
  /** Accessible label for the loading region. */
  label?: string;
  /** Optional caption shown under the spinner. */
  caption?: string;
  /** Minimum height of the loader's container, so it doesn't collapse the layout while loading. */
  minHeight?: string;
}

export function AppLoader({ label = 'Loading', caption, minHeight = '40vh' }: AppLoaderProps) {
  return (
    <div
      className="grid place-items-center"
      style={{ minHeight }}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-3">
        <span className="app-loader-ring" aria-hidden="true" />
        {caption ? <span className="text-xs font-semibold text-[var(--text-muted)]">{caption}</span> : null}
      </div>
    </div>
  );
}
