export interface FixedPortalPlacement {
  top: number;
  left: number;
  width: number;
  placement: "top" | "bottom";
  /** Constrains panel height so content scrolls instead of covering the shell header. */
  maxHeight: number;
}

export interface ComputeFixedPortalPlacementOptions {
  /** Used when menu is not mounted yet. */
  estimatedMenuHeight?: number;
  /** Fixed width in px, or match trigger width with min constraint. */
  menuWidth?: number | "trigger";
  /** Align menu start (left) or end (right) with the trigger box. */
  align?: "start" | "end";
  /**
   * Preferred vertical placement. Flips automatically when the preferred side
   * cannot fit the menu and the opposite side has more (or enough) room.
   * @default "bottom"
   */
  preferredPlacement?: "top" | "bottom";
  gap?: number;
  viewportPadding?: number;
  minMenuWidth?: number;
  /**
   * Minimum viewport Y the menu may start at (keeps panels clear of sticky shell chrome).
   * When omitted, uses `[data-shell-chrome]` bottom edge when present.
   */
  topSafeInset?: number;
}

/** Fallback when shell chrome has not mounted yet (single-row header ~64px + gap). */
const DEFAULT_SHELL_TOP_SAFE_INSET_PX = 72;
const MIN_PORTAL_MENU_HEIGHT_PX = 160;

/**
 * Resolves the sticky shell chrome bottom so fixed portals do not cover the header.
 */
export function resolveShellTopSafeInset(viewportPadding = 8): number {
  if (typeof document === "undefined") {
    return DEFAULT_SHELL_TOP_SAFE_INSET_PX;
  }

  const chrome = document.querySelector("[data-shell-chrome]");
  if (chrome instanceof HTMLElement) {
    const bottom = chrome.getBoundingClientRect().bottom;
    if (Number.isFinite(bottom) && bottom > 0) {
      return Math.ceil(bottom) + viewportPadding;
    }
  }

  return DEFAULT_SHELL_TOP_SAFE_INSET_PX;
}

/**
 * Floating UI / Popper-style collision detection:
 * prefer the requested side; flip when that side cannot fit the menu and the
 * opposite side fits (or has more usable space).
 */
function resolveVerticalPlacement(
  preferredPlacement: "top" | "bottom",
  spaceAbove: number,
  spaceBelow: number,
  estimatedMenuHeight: number,
): "top" | "bottom" {
  const fitsBelow = spaceBelow >= estimatedMenuHeight;
  const fitsAbove = spaceAbove >= estimatedMenuHeight;

  if (preferredPlacement === "bottom") {
    if (fitsBelow) {
      return "bottom";
    }
    if (fitsAbove) {
      return "top";
    }
    return spaceAbove > spaceBelow ? "top" : "bottom";
  }

  if (fitsAbove) {
    return "top";
  }
  if (fitsBelow) {
    return "bottom";
  }
  return spaceBelow > spaceAbove ? "bottom" : "top";
}

/**
 * Positions a `position: fixed` portal menu relative to a trigger using viewport coords.
 * Never enters the sticky shell header band; flips top/bottom based on available space.
 */
export function computeFixedPortalPlacement(
  trigger: HTMLElement,
  menu: HTMLElement | null,
  options: ComputeFixedPortalPlacementOptions = {},
): FixedPortalPlacement {
  const {
    estimatedMenuHeight: fallbackHeight = 260,
    menuWidth: menuWidthOption = "trigger",
    align = "start",
    preferredPlacement = "bottom",
    gap = 4,
    viewportPadding = 8,
    minMenuWidth = 256,
    topSafeInset: topSafeInsetOption,
  } = options;

  const rect = trigger.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return {
      top: 0,
      left: 0,
      width: minMenuWidth,
      placement: "bottom",
      maxHeight: MIN_PORTAL_MENU_HEIGHT_PX,
    };
  }

  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight || 0;
  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth || 0;
  const topSafe =
    topSafeInsetOption ?? resolveShellTopSafeInset(viewportPadding);

  let estimatedMenuHeight = fallbackHeight;
  if (menu) {
    const menuRect = menu.getBoundingClientRect();
    // Prefer scrollHeight so clamped max-height does not shrink the estimate.
    const measured = Math.max(menuRect.height, menu.scrollHeight);
    if (measured > 0) {
      estimatedMenuHeight = measured;
    }
  }

  let menuWidth: number;
  if (menuWidthOption === "trigger") {
    menuWidth = Math.max(
      minMenuWidth,
      Math.min(
        rect.width || minMenuWidth,
        Math.max(viewportWidth - viewportPadding * 2, minMenuWidth),
      ),
    );
  } else {
    menuWidth = menuWidthOption;
  }

  const spaceBelow = Math.max(0, viewportHeight - rect.bottom - viewportPadding);
  const spaceAbove = Math.max(0, rect.top - topSafe - gap);

  let placement = resolveVerticalPlacement(
    preferredPlacement,
    spaceAbove,
    spaceBelow,
    estimatedMenuHeight,
  );

  let top: number;
  let maxHeight: number;

  if (placement === "top") {
    maxHeight = Math.max(
      MIN_PORTAL_MENU_HEIGHT_PX,
      Math.min(estimatedMenuHeight, spaceAbove || estimatedMenuHeight),
    );
    top = rect.top - gap - maxHeight;

    // Keep clear of shell chrome; if clipped, shrink in place rather than
    // forcing a flip back to bottom (which can re-introduce footer collision).
    if (top < topSafe) {
      top = topSafe;
      maxHeight = Math.max(
        MIN_PORTAL_MENU_HEIGHT_PX,
        Math.min(maxHeight, rect.top - gap - top),
      );
      // If top placement is unusable after chrome clamp, fall back to bottom.
      if (
        maxHeight < MIN_PORTAL_MENU_HEIGHT_PX ||
        rect.top - gap - topSafe < MIN_PORTAL_MENU_HEIGHT_PX
      ) {
        placement = "bottom";
        top = rect.bottom + gap;
        maxHeight = Math.max(
          MIN_PORTAL_MENU_HEIGHT_PX,
          Math.min(
            estimatedMenuHeight,
            spaceBelow || viewportHeight - top - viewportPadding,
          ),
        );
      }
    }
  } else {
    top = rect.bottom + gap;
    maxHeight = Math.max(
      MIN_PORTAL_MENU_HEIGHT_PX,
      Math.min(
        estimatedMenuHeight,
        spaceBelow || viewportHeight - top - viewportPadding,
      ),
    );
  }

  // Absolute safety — never paint into the sticky header band.
  if (top < topSafe) {
    top = topSafe;
    if (placement === "bottom") {
      maxHeight = Math.max(
        MIN_PORTAL_MENU_HEIGHT_PX,
        viewportHeight - top - viewportPadding,
      );
    }
  }

  // Keep bottom edge inside the viewport.
  if (top + maxHeight > viewportHeight - viewportPadding) {
    maxHeight = Math.max(
      MIN_PORTAL_MENU_HEIGHT_PX,
      viewportHeight - viewportPadding - top,
    );
  }

  const rawLeft =
    align === "end" ? rect.right - menuWidth : rect.left;

  const left = Math.min(
    Math.max(viewportPadding, rawLeft),
    Math.max(viewportPadding, viewportWidth - menuWidth - viewportPadding),
  );

  return { top, left, width: menuWidth, placement, maxHeight };
}

/** Viewport-safe max height for a fixed portal panel below or above its trigger. */
export function computeFixedPortalMaxHeight(
  placement: FixedPortalPlacement,
  viewportPadding = 8,
): number {
  if (placement.maxHeight > 0) {
    return placement.maxHeight;
  }

  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight || 0;

  return Math.max(
    MIN_PORTAL_MENU_HEIGHT_PX,
    viewportHeight - placement.top - viewportPadding,
  );
}
