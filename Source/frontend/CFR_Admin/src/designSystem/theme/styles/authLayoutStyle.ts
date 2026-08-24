/**
 * Minimal port of the reference project's authLayoutStyle module — CFR_Admin does not
 * have a separate auth-layout screen, but `InputField` (in
 * `src/app/components/formControls/`) references this one helper-text class.
 * Adapted to CFR_Admin's own admin theme tokens (see `modules/admin/theme.css`).
 */
export const authFieldHelperTextClass =
  "text-[length:var(--admin-text-xs)] leading-relaxed text-[var(--text-muted)]";
