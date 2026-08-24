import { AppIcon } from "@app/components/icons";
import { Tooltip } from "@app/components/tooltips/Tooltip";
import { cn } from "@app/utilities/cn";
import { treeSplitToggleButtonClass } from "./treeViewStyles";

export interface TreeSplitPanelToggleProps {
  /** Whether the tree panel is currently expanded. */
  panelExpanded: boolean;
  onToggle: () => void;
  collapseLabel?: string;
  expandLabel?: string;
  tooltipSide?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function TreeSplitPanelToggle({
  panelExpanded,
  onToggle,
  collapseLabel = "Collapse tree",
  expandLabel = "Expand tree",
  tooltipSide = "right",
  className,
}: TreeSplitPanelToggleProps) {
  const label = panelExpanded ? collapseLabel : expandLabel;

  return (
    <Tooltip content={label} side={tooltipSide}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={panelExpanded}
        onClick={onToggle}
        className={cn(treeSplitToggleButtonClass, className)}
      >
        <AppIcon
          name={panelExpanded ? "chevronLeft" : "chevronRight"}
          size="controlClear"
          decorative
        />
      </button>
    </Tooltip>
  );
}
