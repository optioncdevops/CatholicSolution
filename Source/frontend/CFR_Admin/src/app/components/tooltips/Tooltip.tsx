import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@app/utilities/cn";
import {
  themeTooltipClass,
  themeTooltipLayerClass,
} from "@designSystem/theme/styles/componentStyle";

export interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  /** Extra classes for the trigger wrapper (e.g. `w-full` in table cells). */
  triggerClassName?: string;
  delay?: number;
  open?: boolean;
}

export const Tooltip = ({
  children,
  content,
  side = "top",
  className,
  triggerClassName,
  delay = 200,
  open,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    arrowLeft?: number;
    arrowTop?: number;
  }>({ top: 0, left: 0 });
  const [placedSide, setPlacedSide] = useState(side);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const isOpen = open ?? isVisible;

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    setIsVisible(false);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let finalSide = side;

    const spaceTop = rect.top;
    const spaceBottom = viewportHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewportWidth - rect.right;

    const minHeight = 40;
    const minWidth = 100;

    if (side === "top" && spaceTop < minHeight && spaceBottom > minHeight) {
      finalSide = "bottom";
    } else if (
      side === "bottom" &&
      spaceBottom < minHeight &&
      spaceTop > minHeight
    ) {
      finalSide = "top";
    } else if (
      side === "left" &&
      spaceLeft < minWidth &&
      spaceRight > minWidth
    ) {
      finalSide = "right";
    } else if (
      side === "right" &&
      spaceRight < minWidth &&
      spaceLeft > minWidth
    ) {
      finalSide = "left";
    }

    setPlacedSide(finalSide);

    const tooltipWidth = tooltipRef.current
      ? tooltipRef.current.offsetWidth
      : 200;
    const tooltipHeight = tooltipRef.current
      ? tooltipRef.current.offsetHeight
      : 32;
    const offset = 8;

    let top: number;
    let left: number;

    if (finalSide === "top") {
      top = rect.top - tooltipHeight - offset;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (finalSide === "bottom") {
      top = rect.bottom + offset;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (finalSide === "left") {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left - tooltipWidth - offset;
    } else {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.right + offset;
    }

    const minPadding = 8;
    if (left < minPadding) {
      left = minPadding;
    } else if (left + tooltipWidth > viewportWidth - minPadding) {
      left = viewportWidth - tooltipWidth - minPadding;
    }

    if (top < minPadding) {
      top = minPadding;
    } else if (top + tooltipHeight > viewportHeight - minPadding) {
      top = viewportHeight - tooltipHeight - minPadding;
    }

    let arrowLeft: number | undefined;
    let arrowTop: number | undefined;

    if (finalSide === "top" || finalSide === "bottom") {
      const triggerCenter = rect.left + rect.width / 2;
      arrowLeft = Math.min(
        Math.max(triggerCenter - left, 12),
        tooltipWidth - 12,
      );
    } else {
      const triggerCenterY = rect.top + rect.height / 2;
      arrowTop = Math.min(
        Math.max(triggerCenterY - top, 12),
        tooltipHeight - 12,
      );
    }

    setCoords({ top, left, arrowLeft, arrowTop });
  }, [side]);

  const setTooltipRef = useCallback(
    (node: HTMLDivElement | null) => {
      tooltipRef.current = node;
      if (node) {
        updatePosition();
      }
    },
    [updatePosition],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    timerRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    hide();
  };

  /** Keyboard focus only — avoids stuck tooltips when focus returns after a modal closes. */
  const handleFocus = (e: React.FocusEvent) => {
    if (e.currentTarget.matches(":focus-visible")) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      setIsVisible(true);
    }
  };

  const handleBlur = () => {
    hide();
  };

  /** Hide immediately on press/click so tooltips never linger over dialogs. */
  const handlePointerDown = () => {
    hide();
  };

  const child = React.Children.only(children);
  const trigger = React.isValidElement(child)
    ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
        onMouseEnter: (e: React.MouseEvent) => {
          (
            child.props as { onMouseEnter?: (e: React.MouseEvent) => void }
          ).onMouseEnter?.(e);
          handleMouseEnter();
        },
        onMouseLeave: (e: React.MouseEvent) => {
          (
            child.props as { onMouseLeave?: (e: React.MouseEvent) => void }
          ).onMouseLeave?.(e);
          handleMouseLeave();
        },
        onFocus: (e: React.FocusEvent) => {
          (
            child.props as { onFocus?: (e: React.FocusEvent) => void }
          ).onFocus?.(e);
          handleFocus(e);
        },
        onBlur: (e: React.FocusEvent) => {
          (child.props as { onBlur?: (e: React.FocusEvent) => void }).onBlur?.(
            e,
          );
          handleBlur();
        },
        onPointerDown: (e: React.PointerEvent) => {
          (
            child.props as {
              onPointerDown?: (e: React.PointerEvent) => void;
            }
          ).onPointerDown?.(e);
          handlePointerDown();
        },
      })
    : children;

  return (
    <>
      <span ref={triggerRef} className={cn("inline-flex", triggerClassName)}>
        {trigger}
      </span>
      {isOpen &&
        content &&
        createPortal(
          <div
            ref={setTooltipRef}
            role="tooltip"
            className={cn(
              "fixed pointer-events-none px-3 py-1.5 text-xs font-semibold rounded-md shadow-xl whitespace-normal break-words max-w-[280px]",
              themeTooltipLayerClass,
              themeTooltipClass,
              className,
            )}
            style={{
              top: coords.top,
              left: coords.left,
            }}
          >
            {content}
            {placedSide === "top" && (
              <div
                className="absolute top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-[var(--primary)]"
                style={{
                  left: coords.arrowLeft,
                  transform: "translateX(-50%)",
                }}
              />
            )}
            {placedSide === "bottom" && (
              <div
                className="absolute bottom-full w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-transparent border-b-[var(--primary)]"
                style={{
                  left: coords.arrowLeft,
                  transform: "translateX(-50%)",
                }}
              />
            )}
            {placedSide === "left" && (
              <div
                className="absolute left-full w-0 h-0 border-t-[5px] border-b-[5px] border-l-[5px] border-transparent border-l-[var(--primary)]"
                style={{
                  top: coords.arrowTop,
                  transform: "translateY(-50%)",
                }}
              />
            )}
            {placedSide === "right" && (
              <div
                className="absolute right-full w-0 h-0 border-t-[5px] border-b-[5px] border-r-[5px] border-transparent border-r-[var(--primary)]"
                style={{
                  top: coords.arrowTop,
                  transform: "translateY(-50%)",
                }}
              />
            )}
          </div>,
          document.body,
        )}
    </>
  );
};
