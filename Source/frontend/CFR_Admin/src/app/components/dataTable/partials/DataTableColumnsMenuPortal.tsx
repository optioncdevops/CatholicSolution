import { createPortal } from "react-dom";
import type { ReactNode, RefObject } from "react";
import { cn } from "@app/utilities/cn";
import { useFixedPortalPlacement } from "@designSystem/hooks/useFixedPortalPlacement";
import { resolveDataTablePortalLayerClass } from "@designSystem/theme/styles/componentStyle";
import { COLUMN_VISIBILITY_POPOVER_SHELL_CLASS } from "./columnVisibilityPopover.styles";

interface DataTableColumnsMenuPortalProps {
  anchorRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onRequestClose: () => void;
  children: ReactNode;
  /** Estimated panel height before measure (column lists vary). */
  estimatedMenuHeight?: number;
  /** Minimum panel width — content may grow up to CSS max-width. */
  minMenuWidth?: number;
}

/**
 * Renders the Columns menu in a fixed body portal so overflow:hidden table/modal
 * shells cannot clip it — especially when the grid has few rows.
 */
export function DataTableColumnsMenuPortal({
  anchorRef,
  isOpen,
  onRequestClose,
  children,
  estimatedMenuHeight = 320,
  minMenuWidth = 176,
}: DataTableColumnsMenuPortalProps) {
  const { menuRef, placement, maxHeight } = useFixedPortalPlacement(
    anchorRef,
    isOpen,
    {
      onRequestClose,
      align: "end",
      preferredPlacement: "bottom",
      gap: 4,
      estimatedMenuHeight,
      menuWidth: minMenuWidth,
      minMenuWidth,
    },
  );

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={menuRef}
      className={cn(
        COLUMN_VISIBILITY_POPOVER_SHELL_CLASS,
        "fixed",
        resolveDataTablePortalLayerClass(),
      )}
      style={{
        top: placement.top,
        left: placement.left,
        maxHeight,
        minWidth: placement.width,
      }}
      role="dialog"
      aria-label="Columns"
      onMouseDown={(event) => {
        // Keep focus/selection interactions inside the menu from bubbling to
        // document handlers that might treat the portal as "outside".
        event.stopPropagation();
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
