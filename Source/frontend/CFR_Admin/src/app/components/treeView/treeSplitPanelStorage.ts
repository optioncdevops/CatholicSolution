/** Safely read persisted tree-panel collapse preference. */
export function readTreePanelCollapsed(storageKey: string): boolean {
  if (typeof window === "undefined") {return false;}
  try {
    return window.localStorage.getItem(storageKey) === "true";
  } catch {
    return false;
  }
}

/** Safely persist tree-panel collapse preference. */
export function writeTreePanelCollapsed(storageKey: string, collapsed: boolean): void {
  if (typeof window === "undefined") {return;}
  try {
    window.localStorage.setItem(storageKey, String(collapsed));
  } catch {
    // Ignore quota / privacy mode errors.
  }
}
