import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  APP_MODAL_OPEN_ATTR,
  themeFormActionFooterClass,
  themeModalBackdropClass,
  themeModalLayerClass,
} from "@designSystem/theme/styles/componentStyle";
import { cn } from "@app/utilities/cn";
import { AppIcon } from "@app/components/icons";
import { FormBodyMandatoryLegend } from "../formControls/MandatoryIndicator";
import { Tooltip } from "@app/components/tooltips/Tooltip";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";
type ModalHeight = "auto" | "sm" | "md" | "lg" | "full";
type FooterAlign = "start" | "center" | "end" | "between";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * Shows the shared body required-field legend ({@link FormBodyMandatoryLegend})
   * above modal content so long titles are not truncated in the header.
   */
  showMandatory?: boolean;
  /** Optional extra content in the header action cluster (left of Close). */
  headerActions?: React.ReactNode;
  /**
   * Controls the maximum width of the modal.
   * - sm: small dialog
   * - md: default
   * - lg/xl: wider dialogs
   * - full: almost full viewport width
   */
  size?: ModalSize;
  /**
   * Controls the maximum height of the modal content.
   * When not "auto", body becomes scrollable.
   */
  height?: ModalHeight;
  /** Extra classes for the modal panel */
  className?: string;
  /** Extra classes for the scrollable body area */
  bodyClassName?: string;
  /** Align footer content */
  footerAlign?: FooterAlign;
  /**
   * Pins the footer while modal body scrolls; applies premium footer styling.
   * @default true
   */
  stickyFooter?: boolean;
  /** Close modal when clicking on the dark backdrop */
  closeOnOverlayClick?: boolean;
  /** Close modal when pressing Escape key */
  closeOnEsc?: boolean;
  /** Hide the top-right close icon */
  hideCloseButton?: boolean;
  /**
   * When true (default), focuses the first editable field on open.
   * Set false for view-only modals so date filters / inputs are not auto-focused.
   */
  autoFocus?: boolean;
}

const MODAL_REGION_ATTR = "data-modal-region";
type ModalFocusRegion = "body" | "footer" | "header";

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';

const isElementVisible = (el: HTMLElement): boolean => {
  const style = window.getComputedStyle(el);
  if (el.getAttribute("aria-hidden") === "true") {
    return false;
  }
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }
  if (style.pointerEvents === "none") {
    return false;
  }
  return el.getClientRects().length > 0;
};

const isTabStop = (el: HTMLElement): boolean => {
  if (el.tabIndex < 0) {
    return false;
  }
  if (el.hasAttribute("disabled") || (el as HTMLButtonElement).disabled) {
    return false;
  }
  const isReadOnly = (el as HTMLInputElement).readOnly || el.getAttribute("readonly") !== null;
  if (isReadOnly) {
    return false;
  }
  return isElementVisible(el);
};

const sortByDocumentOrder = (elements: HTMLElement[]): HTMLElement[] =>
  [...elements].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

/** Background dialogs become inert so Tab cannot leak into stacked modals. */
const syncModalLayerInertState = (): void => {
  if (typeof document === "undefined") {
    return;
  }

  const layers = document.querySelectorAll<HTMLElement>(`[${APP_MODAL_OPEN_ATTR}="open"]`);
  const topLayer = layers[layers.length - 1] ?? null;

  layers.forEach((layer) => {
    if (layer === topLayer) {
      layer.removeAttribute("inert");
    } else {
      layer.inert = true;
    }
  });
};

const hasHeaderActionTabStops = (container: HTMLElement): boolean => {
  const headerRoot = container.querySelector<HTMLElement>(`[${MODAL_REGION_ATTR}="header"]`);
  if (!headerRoot) {
    return false;
  }

  return Array.from(headerRoot.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).some(
    (el) => isTabStop(el) && el.getAttribute("aria-label") !== "Close",
  );
};

/**
 * Tab stops for dialog focus management.
 * Default order: body -> footer -> header actions (when present).
 * Header close is excluded when a footer exists (mouse / Escape still close).
 */
const getModalTabStops = (container: HTMLElement): HTMLElement[] => {
  const hasFooter = Boolean(container.querySelector(`[${MODAL_REGION_ATTR}="footer"]`));
  const regions: ModalFocusRegion[] = hasFooter
    ? ["body", "footer", ...(hasHeaderActionTabStops(container) ? (["header"] as const) : [])]
    : ["body", "header"];

  const stops: HTMLElement[] = [];

  for (const region of regions) {
    const regionRoot = container.querySelector<HTMLElement>(`[${MODAL_REGION_ATTR}="${region}"]`);
    if (!regionRoot) {
      continue;
    }

    const regionStops = sortByDocumentOrder(
      Array.from(regionRoot.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
        if (!isTabStop(el)) {
          return false;
        }
        if (hasFooter && region === "header" && el.getAttribute("aria-label") === "Close") {
          return false;
        }
        return true;
      }),
    );

    stops.push(...regionStops);
  }

  const hasExplicitTabOrder = stops.some((el) => el.tabIndex > 0);
  if (!hasExplicitTabOrder) {
    return stops;
  }

  return [...stops].sort((a, b) => {
    const tabIndexA = a.tabIndex > 0 ? a.tabIndex : Infinity;
    const tabIndexB = b.tabIndex > 0 ? b.tabIndex : Infinity;
    if (tabIndexA !== tabIndexB) {
      return tabIndexA - tabIndexB;
    }
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
};

/** Only trap Tab while focus is inside this dialog panel. */
const isFocusInsideModalPanel = (modalPanel: HTMLElement, activeEl: HTMLElement | null): boolean =>
  Boolean(activeEl && modalPanel.contains(activeEl));

/** Only the front-most dialog should trap Tab / handle Escape when modals are stacked. */
const isTopmostModalLayer = (modalPanel: HTMLElement): boolean => {
  if (typeof document === "undefined") {
    return true;
  }

  const layers = document.querySelectorAll<HTMLElement>(`[${APP_MODAL_OPEN_ATTR}="open"]`);
  if (layers.length === 0) {
    return true;
  }

  const topLayer = layers[layers.length - 1];
  const ownLayer = modalPanel.closest<HTMLElement>(`[${APP_MODAL_OPEN_ATTR}="open"]`);

  return ownLayer === topLayer;
};

export const BaseModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  showMandatory = false,
  headerActions,
  size = "md",
  height = "auto",
  className,
  bodyClassName,
  footerAlign = "center",
  stickyFooter = true,
  closeOnOverlayClick = false,
  closeOnEsc = true,
  hideCloseButton = false,
  autoFocus = true,
}: ModalProps) => {
  const lastActiveElementRef = useRef<Element | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus management: automatic focus on open and restore on close
  useEffect(() => {
    if (isOpen) {
      lastActiveElementRef.current = document.activeElement;
      syncModalLayerInertState();

      const timer = setTimeout(() => {
        if (!modalRef.current) { return; }
        const tabStops = getModalTabStops(modalRef.current);

        if (!autoFocus) {
          // Prefer the close button; otherwise park focus on the dialog itself.
          const closeButton = modalRef.current.querySelector<HTMLElement>('button[aria-label="Close"]');
          if (closeButton) {
            closeButton.focus();
          } else {
            modalRef.current.setAttribute("tabindex", "-1");
            modalRef.current.focus();
          }
          return;
        }

        const editableFields = tabStops.filter(
          (el) => ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName) || el.getAttribute("role") === "combobox",
        );
        if (editableFields.length > 0) {
          editableFields[0].focus();
        } else if (tabStops.length > 0) {
          tabStops[0].focus();
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        syncModalLayerInertState();
        if (lastActiveElementRef.current instanceof HTMLElement) {
          lastActiveElementRef.current.focus();
        }
        lastActiveElementRef.current = null;
      };
    }
  }, [isOpen, autoFocus]);

  // Focus trap: wrap only at dialog boundaries; leave native Tab alone otherwise.
  useEffect(() => {
    if (!isOpen) { return; }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") { return; }
      if (!modalRef.current) { return; }
      if (!isTopmostModalLayer(modalRef.current)) { return; }

      const activeEl = document.activeElement as HTMLElement | null;
      if (!isFocusInsideModalPanel(modalRef.current, activeEl)) {
        return;
      }

      const tabStops = getModalTabStops(modalRef.current);
      if (tabStops.length === 0) {
        event.preventDefault();
        return;
      }

      const currentIndex = activeEl ? tabStops.indexOf(activeEl) : -1;
      if (currentIndex === -1) {
        return;
      }

      if (event.shiftKey) {
        if (currentIndex === 0) {
          event.preventDefault();
          tabStops[tabStops.length - 1].focus();
        }
      } else if (currentIndex === tabStops.length - 1) {
        event.preventDefault();
        tabStops[0].focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEsc) { return; }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") { return; }
      if (!modalRef.current) { return; }
      if (!isTopmostModalLayer(modalRef.current)) { return; }

      event.stopPropagation();
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); };
  }, [isOpen, closeOnEsc, onClose]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") { return; }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined" || !document.body) { return null; }

  const sizeClassMap: Record<ModalSize, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-[90vw]",
  };

  const heightClassMap: Record<ModalHeight, string> = {
    auto: "",
    sm: "max-h-[40vh]",
    md: "max-h-[60vh]",
    lg: "max-h-[80vh]",
    full: "h-[90vh]",
  };

  const footerAlignClasses: Record<FooterAlign, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  const useStickyFooter = stickyFooter && !!footer;

  const panelClasses = cn(
    "relative flex w-full flex-col overflow-hidden rounded-[var(--radius-panel)] bg-[var(--surface)] shadow-[var(--shadow-elevated)]",
    sizeClassMap[size],
    heightClassMap[height],
    useStickyFooter && "max-h-[90vh]",
    className,
  );

  const bodyClasses = cn(
    "p-6",
    (height !== "auto" || useStickyFooter) && "min-h-0 flex-1 overflow-y-auto",
    bodyClassName,
  );

  return createPortal(
    <div
      className={cn("fixed inset-0 flex items-center justify-center p-4", themeModalLayerClass, themeModalBackdropClass)}
      data-app-modal="open"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        ref={modalRef}
        className={panelClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby="base-modal-title"
        onClick={(event) => { event.stopPropagation(); }}
      >
        {/* Header — title + close only; mandatory legend lives in the body */}
        <div
          className="flex shrink-0 items-center justify-between gap-3 bg-[var(--primary)] px-3 py-2"
          {...{ [MODAL_REGION_ATTR]: "header" }}
        >
          <h3
            id="base-modal-title"
            className="min-w-0 flex-1 truncate text-[length:var(--admin-text-lg)] font-semibold tracking-tight text-white"
            title={typeof title === "string" ? title : undefined}
          >
            {title}
          </h3>
          <div className="flex shrink-0 flex-nowrap items-center justify-end gap-2 sm:gap-3">
            {headerActions}
            {!hideCloseButton && (
              <Tooltip content={"Close"}>
                <button
                  type="button"
                  onClick={onClose}
                  tabIndex={footer ? -1 : 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 shadow-sm transition hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] focus-visible:ring-white/80"
                  aria-label="Close"
                >
                  <AppIcon name="x" size={18} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Body */}
        <div className={bodyClasses} {...{ [MODAL_REGION_ATTR]: "body" }}>
          {showMandatory ? <FormBodyMandatoryLegend /> : null}
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div
            {...{ [MODAL_REGION_ATTR]: "footer" }}
            className={cn(
              footerAlignClasses[footerAlign],
              useStickyFooter
                ? cn("shrink-0", themeFormActionFooterClass, "mx-0 mt-0")
                : "flex shrink-0 flex-wrap gap-2 bg-[var(--surface-muted)] px-3 py-2",
              !useStickyFooter && "px-3 py-2",
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};

// Demo component for showcase
export const ModalDemo = () => {
  const [show, setShow] = React.useState(false);

  return (
    <>
      <button
        onClick={() => { setShow(true); }}
        className="rounded-[var(--admin-control-radius)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
      >
        Open Modal Popup
      </button>
      <BaseModal
        isOpen={show}
        onClose={() => { setShow(false); }}
        title="BaseModal Title"
        size="lg"
        height="md"
        footer={
          <>
            <button
              onClick={() => { setShow(false); }}
              className="rounded-[var(--admin-control-radius)] border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--hover)]"
            >
              Cancel
            </button>
            <button
              onClick={() => { setShow(false); }}
              className="rounded-[var(--admin-control-radius)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-soft)] hover:bg-[var(--primary-hover)]"
            >
              Confirm
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-muted)]">
          This is a demonstration of a modal popup window with a custom colored header and
          footer. You can place any content here. When the content grows taller than the
          configured height, this area will scroll while the header and footer stay fixed.
        </p>
      </BaseModal>
    </>
  );
};
