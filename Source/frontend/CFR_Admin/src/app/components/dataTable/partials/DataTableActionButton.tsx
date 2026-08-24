import { CommonIconButton } from "@app/components/buttons/CommonIconButton";
import { cn } from "@app/utilities/cn";
import {
  DATA_TABLE_ACTION_CONFIG,
  type DataTableActionType,
} from "./dataTableActionConfig";

export interface DataTableActionButtonProps {
  action: DataTableActionType;
  onClick: () => void;
  /** Accessible name; defaults to the action config label. */
  label?: string;
  /** Tooltip text; defaults to the action config label. */
  tooltip?: string;
  disabled?: boolean;
  className?: string;
  tooltipSide?: "top" | "bottom" | "left" | "right";
  showTooltip?: boolean;
}

export const DataTableActionButton: React.FC<DataTableActionButtonProps> = ({
  action,
  onClick,
  label,
  tooltip,
  disabled = false,
  className,
  tooltipSide = "top",
  showTooltip = true,
}) => {
  const config = DATA_TABLE_ACTION_CONFIG[action];
  const resolvedLabel = label ?? config.label;
  const resolvedTooltip = tooltip ?? config.label;

  return (
    <CommonIconButton
      iconName={config.icon}
      iconSize={config.iconSize}
      variant={config.variant}
      tone="soft"
      size={config.size}
      aria-label={resolvedLabel}
      tooltip={showTooltip ? resolvedTooltip : undefined}
      tooltipSide={tooltipSide}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        className,
        disabled && "opacity-50 cursor-not-allowed",
      )}
    />
  );
};
