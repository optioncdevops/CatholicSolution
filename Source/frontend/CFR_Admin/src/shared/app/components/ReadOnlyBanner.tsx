import { Eye } from 'lucide-react';

/** Shown at the top of a page/panel when the signed-in user's role has Read Only access to this
 * feature (see `useFeatureAccessLevel`) — every mutating control on the page is expected to also
 * be disabled via `isReadOnly`, this banner just tells the user why. */
export function ReadOnlyBanner({ featureName }: { featureName: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-panel)] border border-[var(--info)] bg-[var(--info-bg)] p-3">
      <Eye size={14} className="shrink-0 text-[var(--info)]" aria-hidden="true" />
      <p className="text-xs font-semibold text-[var(--info)]">
        Your role has read-only access to {featureName} — you can view, but not add, edit, or delete.
      </p>
    </div>
  );
}
