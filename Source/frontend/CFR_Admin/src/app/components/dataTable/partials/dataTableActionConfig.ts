import type { AppIconName } from "@app/components/icons";
import type { CommonIconButtonProps } from "@app/components/buttons/CommonIconButton";

// ── Action type ──────────────────────────────────────────────────────

export type DataTableActionType =
  | "add"
  | "remove"
  | "edit"
  | "view"
  | "delete"
  | "print"
  | "download"
  | "save"
  | "confirm"
  | "cancel"
  | "approve"
  | "reject"
  | "active"
  | "inactive"
  | "history"
  | "generatePickList"
  | "generateDispatch"
  | "bundleCreation"
  | "dispatch"
  | "verify"
  | "damage"
  | "receipt"
  | "manualEntry"
  | "more"
  | "testMail"
  | "review"
  | "viewFiles"
  | "viewEdr"
  | "qrCode"
  | "inventory"
  | "clone"
  | "send";

// ── Per-action config ────────────────────────────────────────────────

type IconButtonVariant = NonNullable<CommonIconButtonProps["variant"]>;
type IconButtonSize = NonNullable<CommonIconButtonProps["size"]>;

export interface DataTableActionDef {
  icon: AppIconName;
  label: string;
  variant: IconButtonVariant;
  size: IconButtonSize;
  /** Override icon pixel size inside the action button. */
  iconSize?: number;
}

export const DATA_TABLE_ACTION_CONFIG: Record<DataTableActionType, DataTableActionDef> = {
  view: {
    icon: "eye",
    label: "View",
    variant: "primary",
    size: "xs",
  },
  edit: {
    icon: "pencil",
    label: "Edit",
    variant: "info",
    size: "xs",
  },
  clone: {
    icon: "copy",
    label: "Clone Role",
    variant: "primary",
    size: "xs",
  },
  delete: {
    icon: "trash2",
    label: "Delete",
    variant: "danger",
    size: "xs",
  },
  add: {
    icon: "plus",
    label: "Add row",
    variant: "primary",
    size: "xs",
    iconSize: 12,
  },
  remove: {
    icon: "rowRemove",
    label: "Delete",
    variant: "ghost",
    size: "xs",
    iconSize: 12,
  },
  save: {
    icon: "save",
    label: "Save",
    variant: "success",
    size: "xs",
  },
  confirm: {
    icon: "checkCircle2",
    label: "Confirm line",
    variant: "success",
    size: "xs",
  },
  cancel: {
    icon: "x",
    label: "Cancel",
    variant: "ghost",
    size: "xs",
  },
  approve: {
    icon: "checkCircle2",
    label: "Approve",
    variant: "success",
    size: "xs",
  },
  reject: {
    icon: "xCircle",
    label: "Reject",
    variant: "danger",
    size: "xs",
  },
  history: {
    icon: "history",
    label: "History",
    variant: "secondary",
    size: "xs",
  },
  print: {
    icon: "printer",
    label: "Print",
    variant: "secondary",
    size: "xs",
  },
  download: {
    icon: "download",
    label: "Download",
    variant: "secondary",
    size: "xs",
  },
  active: {
    icon: "toggleRight",
    label: "Activate",
    variant: "success",
    size: "xs",
  },
  inactive: {
    icon: "toggleLeft",
    label: "Inactivate",
    variant: "warning",
    size: "xs",
  },
  generatePickList: {
    icon: "tag",
    label: "Generate Pick List",
    variant: "warning",
    size: "xs",
  },
  generateDispatch: {
    icon: "truckFast",
    label: "Generate Dispatch",
    variant: "warning",
    size: "xs",
    iconSize: 16,
  },
  bundleCreation: {
    icon: "packagePlus",
    label: "Bundle Creation",
    variant: "primary",
    size: "xs",
  },
  dispatch: {
    icon: "truckFast",
    label: "Store dispatch",
    variant: "secondary",
    size: "xs",
    iconSize: 16,
  },
  verify: {
    icon: "clipboardCheck",
    label: "Confirm Materials",
    variant: "success",
    size: "xs",
  },
  damage: {
    icon: "packageX",
    label: "Damaged entry",
    variant: "warning",
    size: "xs",
  },
  receipt: {
    icon: "receipt",
    label: "Receipt entry",
    variant: "primary",
    size: "xs",
  },
  manualEntry: {
    icon: "squarePen",
    label: "Manual entry",
    variant: "secondary",
    size: "xs",
  },
  more: {
    icon: "moreHorizontal",
    label: "More actions",
    variant: "ghost",
    size: "xs",
    iconSize: 14,
  },
  testMail: {
    icon: "mail",
    label: "Send Test Email",
    variant: "info",
    size: "xs",
  },
  review: {
    icon: "clipboardCheck",
    label: "Review",
    variant: "warning",
    size: "xs",
  },
  viewFiles: {
    icon: "fileText",
    label: "View Files",
    variant: "secondary",
    size: "xs",
  },
  viewEdr: {
    icon: "list",
    label: "View Early Dispatch Requests",
    variant: "secondary",
    size: "xs",
  },
  qrCode: {
    icon: "qrCode",
    label: "Print Label",
    variant: "secondary",
    size: "xs",
  },
  inventory: {
    icon: "addBox",
    label: "Add to Store",
    variant: "success",
    size: "xs",
  },
  send: {
    icon: "send",
    label: "Send",
    variant: "info",
    size: "xs",
  },
};

/** Max row actions shown as icon buttons before overflow moves to More menu. */
export const DATA_TABLE_MAX_DIRECT_ROW_ACTIONS = 4;

/** Enterprise row-action display order. */
export const DATA_TABLE_ROW_ACTION_ORDER: readonly DataTableActionType[] = [
  "view",
  "approve",
  "review",
  "edit",
  "clone",
  "testMail",
  "active",
  "inactive",
  "delete",
  "reject",
  "history",
  "print",
  "download",
  "save",
  "confirm",
  "cancel",
  "generatePickList",
  "generateDispatch",
  "send",
  "bundleCreation",
  "dispatch",
  "viewEdr",
  "verify",
  "damage",
  "receipt",
  "manualEntry",
  "inventory",
  "qrCode",
  "add",
  "remove",
  "more",
] as const;

const ROW_ACTION_ORDER_INDEX = new Map<DataTableActionType, number>(
  DATA_TABLE_ROW_ACTION_ORDER.map((action, index) => [action, index]),
);

/** Sort row actions into the standard enterprise order. */
export function sortDataTableRowActions<T extends { action: DataTableActionType }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aIndex = ROW_ACTION_ORDER_INDEX.get(a.action) ?? 999;
    const bIndex = ROW_ACTION_ORDER_INDEX.get(b.action) ?? 999;
    return aIndex - bIndex;
  });
}

const PRIMARY_ROW_ACTIONS = new Set<DataTableActionType>([
  "view",
  "edit",
  "active",
  "inactive",
]);

export function partitionDataTableRowActions<T extends { action: DataTableActionType }>(
  items: T[],
  maxDirect: number = DATA_TABLE_MAX_DIRECT_ROW_ACTIONS,
): { direct: T[]; overflow: T[] } {
  const sorted = sortDataTableRowActions(items);
  if (sorted.length <= maxDirect) {
    return { direct: sorted, overflow: [] };
  }

  const direct = sorted.filter((item) => PRIMARY_ROW_ACTIONS.has(item.action));
  const overflow = sorted.filter((item) => !PRIMARY_ROW_ACTIONS.has(item.action));
  return { direct, overflow };
}

export const DATA_TABLE_ADD_ROW_BTN =
  "inline-flex items-center gap-1 rounded border border-primary-300 bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-700 transition-colors cursor-pointer hover:bg-primary-100 dark:border-primary-500/60 dark:bg-primary-900/20 dark:text-primary-300 dark:hover:bg-primary-900/40 disabled:opacity-50 disabled:cursor-not-allowed";
