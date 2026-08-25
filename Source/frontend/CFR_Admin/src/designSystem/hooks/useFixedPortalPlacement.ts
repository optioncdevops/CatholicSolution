import { useEffect, useRef, useState, type RefObject } from "react";
import {
  computeFixedPortalMaxHeight,
  computeFixedPortalPlacement,
  type ComputeFixedPortalPlacementOptions,
  type FixedPortalPlacement,
} from "@designSystem/layouts/utilities/fixedPortalPlacement";

type UseFixedPortalPlacementOptions = ComputeFixedPortalPlacementOptions & {
  onRequestClose?: () => void;
  /** When set, outside-click detection uses this root instead of the menu node. */
  interactionRootRef?: RefObject<HTMLElement | null>;
};

/**
 * Positions a `position: fixed` portal menu relative to a trigger.
 * Recalculates on open, scroll (capture), and resize; closes on Escape / outside click.
 */
export function useFixedPortalPlacement(
  anchorRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  options: UseFixedPortalPlacementOptions = {},
) {
  const {
    onRequestClose,
    interactionRootRef,
    viewportPadding = 8,
    estimatedMenuHeight = 320,
    menuWidth = "trigger",
    align = "start",
    preferredPlacement = "bottom",
    gap = 4,
    minMenuWidth = 256,
  } = options;

  const menuRef = useRef<HTMLDivElement | null>(null);
  const [placement, setPlacement] = useState<FixedPortalPlacement>({
    top: 0,
    left: 0,
    width: typeof menuWidth === "number" ? menuWidth : minMenuWidth,
    placement: preferredPlacement,
    maxHeight: 320,
  });
  const [maxHeight, setMaxHeight] = useState(320);

  useEffect(() => {
    if (!isOpen) {return;}

    const placementOptions: ComputeFixedPortalPlacementOptions = {
      estimatedMenuHeight,
      menuWidth,
      align,
      preferredPlacement,
      gap,
      viewportPadding,
      minMenuWidth,
    };

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) {return;}

      const next = computeFixedPortalPlacement(
        anchor,
        menuRef.current,
        placementOptions,
      );
      setPlacement(next);
      setMaxHeight(computeFixedPortalMaxHeight(next, viewportPadding));
    };

    update();
    const remeasureId = window.setTimeout(update, 0);
    const rafId = requestAnimationFrame(() => {
      update();
      window.setTimeout(update, 50);
    });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {onRequestClose?.();}
    };

    const onDocDown = (event: MouseEvent) => {
      const anchor = anchorRef.current;
      const interactionRoot = interactionRootRef?.current ?? menuRef.current;
      if (!anchor || !interactionRoot) {return;}

      const target = event.target as Node;
      const insideMenu = interactionRoot.contains(target);
      const insideAnchor = anchor.contains(target);
      if (!insideMenu && !insideAnchor) {onRequestClose?.();}
    };

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocDown);

    return () => {
      window.clearTimeout(remeasureId);
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocDown);
    };
  }, [
    align,
    preferredPlacement,
    anchorRef,
    estimatedMenuHeight,
    gap,
    isOpen,
    menuWidth,
    minMenuWidth,
    onRequestClose,
    viewportPadding,
    interactionRootRef,
  ]);

  return { menuRef, placement, maxHeight };
}
