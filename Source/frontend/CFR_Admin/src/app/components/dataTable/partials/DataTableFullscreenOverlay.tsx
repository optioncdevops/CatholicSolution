import React, { useEffect } from "react";
import { createPortal } from "react-dom";

import { cn } from "@app/utilities/cn";
import {
  themeDataTableFullscreenBackdropClass,
  themeDataTableFullscreenLayerClass,
} from "@designSystem/theme/styles/componentStyle";

export interface DataTableFullscreenOverlayProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Debounces rapid open/close toggles from toolbar + backdrop clicks. */
  isTogglingRef?: React.MutableRefObject<boolean>;
  className?: string;
}

function runCloseWithToggleGuard(
  onClose: () => void,
  isTogglingRef?: React.MutableRefObject<boolean>,
): void {
  if (isTogglingRef?.current) {return;}

  if (isTogglingRef) {
    isTogglingRef.current = true;
  }

  onClose();

  if (isTogglingRef) {
    window.setTimeout(() => {
      isTogglingRef.current = false;
    }, 300);
  }
}

/**
 * Portals a fixed fullscreen shell to `document.body` above modal overlays.
 * Escape closes fullscreen only — parent modal stays open.
 */
export function DataTableFullscreenOverlay({
  open,
  onClose,
  children,
  isTogglingRef,
  className,
}: DataTableFullscreenOverlayProps) {
  useEffect(() => {
    if (!open) {return;}

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {return;}
      event.preventDefault();
      event.stopPropagation();
      runCloseWithToggleGuard(onClose, isTogglingRef);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => { window.removeEventListener("keydown", handleKeyDown, true); };
  }, [open, onClose, isTogglingRef]);

  if (!open || typeof document === "undefined" || !document.body) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex items-stretch justify-center p-4 transition-opacity duration-200",
        themeDataTableFullscreenLayerClass,
        themeDataTableFullscreenBackdropClass,
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Table fullscreen view"
      onClick={(event) => {
        if (event.target !== event.currentTarget) {return;}
        runCloseWithToggleGuard(onClose, isTogglingRef);
      }}
    >
      <div
        className="flex min-h-0 min-w-0 w-full max-w-full flex-col"
        onClick={(event) => { event.stopPropagation(); }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
