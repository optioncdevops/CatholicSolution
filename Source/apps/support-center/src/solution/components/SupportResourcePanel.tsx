/**
 * @deprecated Resource Library was removed from Support Center in v1.4.1.
 *
 * This compatibility shim is intentionally kept so in-place upgrades from
 * earlier source bundles overwrite the legacy SupportResourcePanel.tsx file.
 * The retired panel must not render or depend on the removed supportResources
 * dataset. New code must use the ticket workspace in SupportCenterPage.
 */
export function SupportResourcePanel() {
  return null;
}

export default SupportResourcePanel;
