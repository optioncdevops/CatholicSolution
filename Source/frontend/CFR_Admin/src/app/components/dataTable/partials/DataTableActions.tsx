import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { cn } from "@app/utilities/cn";
import { DataTableActionButton } from "./DataTableActionButton";
import {
  DATA_TABLE_ACTION_CONFIG,
  DATA_TABLE_MAX_DIRECT_ROW_ACTIONS,
  partitionDataTableRowActions,
  type DataTableActionType,
} from "./dataTableActionConfig";

export interface DataTableActionItem {
  action: DataTableActionType;
  onClick: () => void;
  /** When false, the action is omitted. Defaults to true. */
  visible?: boolean;
  /** Accessible name; defaults to the action config label. */
  label?: string;
  /** Tooltip text; defaults to the action config label. */
  tooltip?: string;
  disabled?: boolean;
  className?: string;
  tooltipSide?: "top" | "bottom" | "left" | "right";
  showTooltip?: boolean;
}

export interface DataTableActionsProps {
  /** Legacy/manual composition — still fully supported. */
  children?: ReactNode;
  /** Config-driven row actions rendered via DataTableActionButton. */
  actions?: DataTableActionItem[];
  align?: "center" | "start" | "end" | "left" | "right";
  gap?: "tight" | "normal";
  className?: string;
  /**
   * Stop click/key events from bubbling to the table row (e.g. row selection).
   * @default true
   */
  stopPropagation?: boolean;
  /** Sort actions into View → Edit → Activate → Delete → workflow order. @default true */
  autoOrder?: boolean;
  /** Max icon actions before overflow moves to More menu. @default 4 */
  maxDirectActions?: number;
}

const ALIGN_MAP: Record<string, string> = {
  center: "justify-center",
  start: "justify-start",
  end: "justify-end",
  left: "justify-start",
  right: "justify-end",
};

const GAP_MAP: Record<string, string> = {
  tight: "gap-0.5",
  normal: "gap-1",
};

function filterActionItems(items: DataTableActionItem[] | undefined): DataTableActionItem[] {
  if (!items?.length) {return [];}
  return items.filter(
    (item) => item.visible !== false && item.onClick != null,
  );
}

function DataTableActionsOverflowMenu({
  items,
  stopPropagation,
}: {
  items: DataTableActionItem[];
  stopPropagation: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {return;}

    const handleClickOutside = (event: Event) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => { document.removeEventListener("mousedown", handleClickOutside, true); };
  }, [open]);

  if (items.length === 0) {return null;}

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <DataTableActionButton
        action="more"
        tooltip="More actions"
        onClick={() => { setOpen((prev) => !prev); }}
      />
      {open ? (
        <div
          className="absolute right-0 z-[120] mt-1 min-w-[9.5rem] rounded-md border border-slate-200 bg-white py-1 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900"
          role="menu"
        >
          {items.map((item, index) => {
            const config = DATA_TABLE_ACTION_CONFIG[item.action];
            const resolvedLabel = item.label ?? config.label;
            return (
              <button
                key={`${item.action}-overflow-${index}`}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className="flex w-full items-center px-3 py-1.5 text-left text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={(event) => {
                  if (stopPropagation) {
                    event.stopPropagation();
                  }
                  item.onClick();
                  setOpen(false);
                }}
              >
                {resolvedLabel}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export const DataTableActions: React.FC<DataTableActionsProps> = ({
  children,
  actions,
  align = "start",
  gap = "tight",
  className,
  stopPropagation = true,
  autoOrder = true,
  maxDirectActions = DATA_TABLE_MAX_DIRECT_ROW_ACTIONS,
}) => {
  const filteredActions = filterActionItems(actions);
  const { direct, overflow } = autoOrder
    ? partitionDataTableRowActions(filteredActions, maxDirectActions)
    : { direct: filteredActions, overflow: [] as DataTableActionItem[] };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-nowrap items-center",
        ALIGN_MAP[align],
        GAP_MAP[gap],
        className,
      )}
      onClick={stopPropagation ? handleClick : undefined}
      onKeyDown={stopPropagation ? handleKeyDown : undefined}
    >
      {direct.map((item, index) => (
        <DataTableActionButton
          key={`${item.action}-${index}`}
          action={item.action}
          onClick={item.onClick}
          label={item.label}
          tooltip={item.tooltip}
          disabled={item.disabled}
          className={item.className}
          tooltipSide={item.tooltipSide}
          showTooltip={item.showTooltip}
        />
      ))}
      <DataTableActionsOverflowMenu items={overflow} stopPropagation={stopPropagation} />
      {children}
    </div>
  );
};

export default DataTableActions;
